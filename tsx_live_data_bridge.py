#!/usr/bin/env python3
# ════════════════════════════════════════════════════════════════════════════════
# © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
# ════════════════════════════════════════════════════════════════════════════════
#
# PROPRIETARY AND CONFIDENTIAL - INTELLECTUAL PROPERTY PROTECTION
#
# This file contains proprietary intellectual property of Ryan Barbrick.
# All concepts, algorithms, implementations, and innovations are protected by
# copyright law and are considered trade secrets.
#
# PROVISIONAL PATENT NOTICE:
# The ideas, methods, systems, and code contained in this file are subject to
# provisional patent protection. Unauthorized use, reproduction, modification,
# or distribution is strictly prohibited.
#
# LEGAL WARNING:
# Unauthorized use of this intellectual property may result in:
# - Civil litigation for copyright infringement
# - Claims for actual and statutory damages ($750-$150,000 per work)
# - Injunctive relief and cease & desist orders
# - Criminal prosecution for willful infringement
# - Recovery of attorney fees and legal costs
#
# CREATOR INFORMATION:
# Author: Ryan Barbrick
# Business: Barbrick Design
# Contact: BarbrickDesign@gmail.com
# AI Assistant: Merlin AI
# Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
#
# PATENT DECLARATION:
# File: tsx_live_data_bridge.py
# Declaration ID: IP-625F8C86-MLL2902T
# Date: 2026-02-13
# Innovation Type: Software Implementation, Algorithm, System Design
#
# For licensing inquiries, contact: BarbrickDesign@gmail.com
# ════════════════════════════════════════════════════════════════════════════════

#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
TopStepX Live Data Bridge
This script creates a websocket server that streams live data from the TopStepX API
to the browser-based trading application.
"""

import os
import sys
import json
import logging
import asyncio
import argparse
import datetime
import signal
from typing import Dict, Any, List, Optional, Set, Callable
import concurrent.futures

# Add the tsxapi4py module to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'tsxapi4py-main', 'src')))

import websockets
from websockets.server import WebSocketServerProtocol

try:
    from tsxapipy import (
        APIClient,
        DataStream,
        authenticate,
        AuthenticationError,
        ConfigurationError,
        APIError,
        StreamConnectionState,
    )
except ImportError as e:
    print(f"Error importing tsxapipy: {e}")
    print("Make sure you have installed all dependencies listed in requirements.txt")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s [%(levelname)s]: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("TSXLiveDataBridge")

# Global variables
connected_clients: Set[WebSocketServerProtocol] = set()
active_contract_streams: Dict[str, DataStream] = {}
api_client: Optional[APIClient] = None
executor = concurrent.futures.ThreadPoolExecutor()
token_refresh_task = None


async def broadcast_message(message: Dict[str, Any]) -> None:
    """
    Broadcast a message to all connected WebSocket clients
    """
    if not connected_clients:
        return
        
    message_json = json.dumps(message)
    disconnected_clients = set()
    
    for client in connected_clients:
        try:
            await client.send(message_json)
        except Exception as e:
            logger.error(f"Error sending to client: {e}")
            disconnected_clients.add(client)
    
    # Clean up disconnected clients
    for client in disconnected_clients:
        connected_clients.remove(client)


# Callbacks for TSX API data streams
def handle_live_quote(quote_data: Any, contract_id: str) -> None:
    """Handle live quote data from TSX API"""
    asyncio.run_coroutine_threadsafe(
        broadcast_message({
            "type": "quote", 
            "contract": contract_id,
            "data": quote_data
        }),
        asyncio.get_event_loop()
    )

def handle_live_trade(trade_data: Any, contract_id: str) -> None:
    """Handle live trade data from TSX API"""
    asyncio.run_coroutine_threadsafe(
        broadcast_message({
            "type": "trade", 
            "contract": contract_id,
            "data": trade_data
        }),
        asyncio.get_event_loop()
    )

def handle_stream_state_change(state_str: str, contract_id: str) -> None:
    """Handle stream state change"""
    logger.info(f"Stream state for {contract_id}: {state_str}")
    asyncio.run_coroutine_threadsafe(
        broadcast_message({
            "type": "state", 
            "contract": contract_id,
            "data": {"state": state_str}
        }),
        asyncio.get_event_loop()
    )

def handle_stream_error(error: Any, contract_id: str) -> None:
    """Handle stream errors"""
    logger.error(f"Stream error for {contract_id}: {error}")
    asyncio.run_coroutine_threadsafe(
        broadcast_message({
            "type": "error", 
            "contract": contract_id,
            "data": {"message": str(error)}
        }),
        asyncio.get_event_loop()
    )


def create_quote_callback(contract_id: str) -> Callable:
    """Create a callback function for quotes with the contract_id embedded"""
    def callback(data: Any) -> None:
        handle_live_quote(data, contract_id)
    return callback


def create_trade_callback(contract_id: str) -> Callable:
    """Create a callback function for trades with the contract_id embedded"""
    def callback(data: Any) -> None:
        handle_live_trade(data, contract_id)
    return callback


def create_state_callback(contract_id: str) -> Callable:
    """Create a callback function for state changes with the contract_id embedded"""
    def callback(state: str) -> None:
        handle_stream_state_change(state, contract_id)
    return callback


def create_error_callback(contract_id: str) -> Callable:
    """Create a callback function for errors with the contract_id embedded"""
    def callback(error: Any) -> None:
        handle_stream_error(error, contract_id)
    return callback


async def subscribe_to_contract(contract_id: str) -> bool:
    """
    Subscribe to a contract's live data feed
    """
    global api_client, active_contract_streams
    
    # Check if we're already subscribed to this contract
    if contract_id in active_contract_streams:
        logger.info(f"Already subscribed to {contract_id}")
        return True
        
    if not api_client:
        logger.error("API client not initialized")
        return False
        
    try:
        # Create a data stream for the contract
        stream = DataStream(
            api_client=api_client,
            contract_id_to_subscribe=contract_id,
            on_quote_callback=create_quote_callback(contract_id),
            on_trade_callback=create_trade_callback(contract_id),
            on_state_change_callback=create_state_callback(contract_id),
            on_error_callback=create_error_callback(contract_id)
        )
        
        # Start the stream in the executor
        future = executor.submit(stream.start)
        result = future.result(timeout=10)
        
        if result:
            logger.info(f"Successfully subscribed to {contract_id}")
            active_contract_streams[contract_id] = stream
            return True
        else:
            logger.error(f"Failed to start stream for {contract_id}")
            return False
            
    except Exception as e:
        logger.error(f"Error subscribing to {contract_id}: {e}")
        return False


async def unsubscribe_from_contract(contract_id: str) -> bool:
    """
    Unsubscribe from a contract's live data feed
    """
    global active_contract_streams
    
    if contract_id not in active_contract_streams:
        logger.info(f"Not subscribed to {contract_id}")
        return True
        
    try:
        stream = active_contract_streams[contract_id]
        future = executor.submit(stream.stop)
        future.result(timeout=10)
        
        del active_contract_streams[contract_id]
        logger.info(f"Unsubscribed from {contract_id}")
        return True
        
    except Exception as e:
        logger.error(f"Error unsubscribing from {contract_id}: {e}")
        return False


async def refresh_auth_token() -> None:
    """
    Periodically refresh the authentication token
    """
    global api_client
    
    while True:
        try:
            # Sleep for 50 minutes (tokens typically valid for 60 mins)
            await asyncio.sleep(50 * 60)
            
            if not api_client:
                continue
                
            logger.info("Refreshing authentication token")
            # Call the refresh method of the API client
            refreshed = await asyncio.get_event_loop().run_in_executor(
                executor, 
                api_client.refresh_token
            )
            
            if refreshed:
                logger.info("Successfully refreshed token")
                
                # Update all active streams with the new token
                for contract_id, stream in active_contract_streams.items():
                    stream.update_token(api_client.token)
            else:
                logger.error("Failed to refresh token")
                
        except Exception as e:
            logger.error(f"Error refreshing token: {e}")


async def handle_websocket(websocket: WebSocketServerProtocol, path: str) -> None:
    """
    Handle WebSocket connections from clients
    """
    client_address = f"{websocket.remote_address[0]}:{websocket.remote_address[1]}"
    logger.info(f"Client connected: {client_address}")
    
    # Add the client to our set of connected clients
    connected_clients.add(websocket)
    
    try:
        # Send initial connection confirmation
        await websocket.send(json.dumps({
            "type": "connected",
            "message": "Connected to TSX Live Data Bridge"
        }))
        
        # Process messages from this client
        async for message in websocket:
            try:
                data = json.loads(message)
                action = data.get("action")
                
                if action == "subscribe":
                    contract_id = data.get("contract")
                    if contract_id:
                        success = await subscribe_to_contract(contract_id)
                        await websocket.send(json.dumps({
                            "type": "subscription",
                            "contract": contract_id,
                            "success": success
                        }))
                    else:
                        await websocket.send(json.dumps({
                            "type": "error",
                            "message": "Missing contract ID for subscription"
                        }))
                
                elif action == "unsubscribe":
                    contract_id = data.get("contract")
                    if contract_id:
                        success = await unsubscribe_from_contract(contract_id)
                        await websocket.send(json.dumps({
                            "type": "unsubscription",
                            "contract": contract_id,
                            "success": success
                        }))
                    else:
                        await websocket.send(json.dumps({
                            "type": "error",
                            "message": "Missing contract ID for unsubscription"
                        }))
                
                elif action == "list":
                    # List all active subscriptions
                    await websocket.send(json.dumps({
                        "type": "subscriptions",
                        "contracts": list(active_contract_streams.keys())
                    }))
                
                else:
                    await websocket.send(json.dumps({
                        "type": "error",
                        "message": f"Unknown action: {action}"
                    }))
                    
            except json.JSONDecodeError:
                await websocket.send(json.dumps({
                    "type": "error",
                    "message": "Invalid JSON message"
                }))
                
    except websockets.exceptions.ConnectionClosed:
        logger.info(f"Client disconnected: {client_address}")
    except Exception as e:
        logger.error(f"Error handling client {client_address}: {e}")
    finally:
        # Remove the client from our set
        if websocket in connected_clients:
            connected_clients.remove(websocket)


async def shutdown(server):
    """Shutdown the WebSocket server and clean up resources"""
    logger.info("Shutting down server...")
    
    # Stop the token refresh task
    global token_refresh_task
    if token_refresh_task:
        token_refresh_task.cancel()
        
    # Close all WebSocket connections
    if connected_clients:
        logger.info(f"Closing {len(connected_clients)} client connections")
        for websocket in connected_clients.copy():
            try:
                await websocket.close()
            except:
                pass
        connected_clients.clear()
    
    # Stop all data streams
    logger.info(f"Stopping {len(active_contract_streams)} data streams")
    for contract_id in list(active_contract_streams.keys()):
        await unsubscribe_from_contract(contract_id)
    
    # Close the WebSocket server
    server.close()
    await server.wait_closed()
    
    # Shutdown the executor
    executor.shutdown(wait=True)
    
    logger.info("Server shutdown complete")


async def main():
    """Main entry point for the script"""
    global api_client, token_refresh_task
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="TopStepX Live Data Bridge")
    parser.add_argument("--host", default="localhost", help="Host to bind server to")
    parser.add_argument("--port", type=int, default=8765, help="Port to bind server to")
    args = parser.parse_args()
    
    try:
        # Authenticate with TopStepX API
        logger.info("Authenticating with TopStepX API...")
        initial_token, token_acquired_at = await asyncio.get_event_loop().run_in_executor(
            executor,
            authenticate
        )
        
        # Create API client
        api_client = APIClient(
            initial_token=initial_token,
            token_acquired_at=token_acquired_at
        )
        logger.info("Successfully authenticated with TopStepX API")
        
        # Start token refresh task
        token_refresh_task = asyncio.create_task(refresh_auth_token())
        
        # Start WebSocket server
        logger.info(f"Starting WebSocket server on {args.host}:{args.port}")
        server = await websockets.serve(
            handle_websocket, 
            args.host, 
            args.port
        )
        
        # Setup signal handlers for graceful shutdown
        loop = asyncio.get_running_loop()
        for sig in (signal.SIGINT, signal.SIGTERM):
            loop.add_signal_handler(sig, lambda: asyncio.create_task(shutdown(server)))
        
        logger.info(f"WebSocket server running at ws://{args.host}:{args.port}")
        await server.wait_closed()
        
    except Exception as e:
        logger.error(f"Error in main: {e}")
        sys.exit(1)


if __name__ == "__main__":
    try:
        # Check if required dependencies are installed
        import websockets
    except ImportError:
        logger.error("Missing required dependency: websockets")
        print("Please install the required dependency: pip install websockets")
        sys.exit(1)
        
    asyncio.run(main())
