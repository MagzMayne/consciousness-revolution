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
# File: tsx_live_data_server.py
# Declaration ID: IP-10CB5174-MLL2902T
# Date: 2026-02-13
# Innovation Type: Software Implementation, Algorithm, System Design
#
# For licensing inquiries, contact: BarbrickDesign@gmail.com
# ════════════════════════════════════════════════════════════════════════════════

#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
TopStepX Live Data Server

This script creates a bridge between the TopStepX API and our HTML/JavaScript trading platform.
It fetches live market data through the TSX API and streams it to the browser via WebSocket.
"""

import os
import sys
import logging
import json
import time
import asyncio
import argparse
import websockets
from datetime import datetime
from typing import Dict, List, Any, Set

# Add the TSX API to the Python path
tsx_api_path = os.path.join(os.path.dirname(__file__), 'tsxapi4py-main', 'src')
if tsx_api_path not in sys.path:
    sys.path.insert(0, tsx_api_path)

try:
    from tsxapipy import (
        APIClient, 
        DataStream, 
        authenticate,
        AuthenticationError, 
        ConfigurationError,
        APIError,
        StreamConnectionState
    )
    from tsxapipy.api.schemas import Contract
except ImportError as e:
    print(f"Error importing TSX API: {e}")
    print("Please make sure the 'tsxapi4py-main' directory is in the correct location.")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s [%(levelname)s]: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("TSXLiveDataServer")

# Global variables
active_clients: Set[websockets.WebSocketServerProtocol] = set()
last_quotes: Dict[str, Dict[str, Any]] = {}
streaming_contracts: Dict[str, Any] = {}
api_client = None
data_stream = None

# Market symbols to contract IDs mapping
MARKET_SYMBOLS = {
    'ES': 'ES-CME',  # E-mini S&P 500
    'NQ': 'NQ-CME',  # E-mini NASDAQ 100
    'YM': 'YM-CBOT', # E-mini Dow
    'RTY': 'RTY-CME', # E-mini Russell 2000
    'CL': 'CL-NYMEX', # Crude Oil
    'GC': 'GC-COMEX', # Gold
    'SI': 'SI-COMEX', # Silver
    'ZB': 'ZB-CBOT', # Treasury Bond
    '6E': '6E-CME',  # Euro FX
    'ZC': 'ZC-CBOT', # Corn
}

async def broadcast_message(message: Dict[str, Any]):
    """Broadcast a message to all connected clients."""
    if not active_clients:
        return
    
    message_json = json.dumps(message)
    dead_clients = set()
    
    for client in active_clients:
        try:
            await client.send(message_json)
        except websockets.exceptions.ConnectionClosed:
            dead_clients.add(client)
    
    # Remove dead clients
    for dead_client in dead_clients:
        active_clients.remove(dead_client)

# TSX API callbacks
def on_quote(quote_data: Dict[str, Any]):
    """Handle incoming quote data from the TSX API."""
    contract_id = quote_data.get('contractId', '')
    contract_symbol = next((sym for sym, cid in MARKET_SYMBOLS.items() if cid == contract_id), contract_id)
    
    # Create a simplified quote object for the frontend
    quote = {
        'symbol': contract_symbol,
        'timestamp': quote_data.get('timestamp', datetime.now().isoformat()),
        'price': quote_data.get('price', 0),
        'bid': quote_data.get('bp', 0),
        'ask': quote_data.get('ap', 0),
        'bidSize': quote_data.get('bs', 0),
        'askSize': quote_data.get('as', 0),
        'volume': quote_data.get('volume', 0)
    }
    
    last_quotes[contract_symbol] = quote
    
    # Broadcast to all clients
    asyncio.create_task(broadcast_message({
        'type': 'quote',
        'data': quote
    }))
    
    logger.debug(f"Quote: {contract_symbol} @ {quote['price']} (bid: {quote['bid']}, ask: {quote['ask']})")

def on_trade(trade_data: Dict[str, Any]):
    """Handle incoming trade data from the TSX API."""
    contract_id = trade_data.get('contractId', '')
    contract_symbol = next((sym for sym, cid in MARKET_SYMBOLS.items() if cid == contract_id), contract_id)
    
    # Create a simplified trade object for the frontend
    trade = {
        'symbol': contract_symbol,
        'timestamp': trade_data.get('timestamp', datetime.now().isoformat()),
        'price': trade_data.get('price', 0),
        'size': trade_data.get('size', 0),
        'side': trade_data.get('aggressorSide', '')
    }
    
    # Broadcast to all clients
    asyncio.create_task(broadcast_message({
        'type': 'trade',
        'data': trade
    }))
    
    logger.debug(f"Trade: {contract_symbol} @ {trade['price']} x {trade['size']} ({trade['side']})")

def on_depth(depth_data: Dict[str, Any]):
    """Handle incoming depth data from the TSX API."""
    contract_id = depth_data.get('contractId', '')
    contract_symbol = next((sym for sym, cid in MARKET_SYMBOLS.items() if cid == contract_id), contract_id)
    
    # Create a simplified depth object for the frontend
    depth = {
        'symbol': contract_symbol,
        'timestamp': datetime.now().isoformat(),
        'bids': depth_data.get('bids', []),
        'asks': depth_data.get('asks', [])
    }
    
    # Broadcast to all clients
    asyncio.create_task(broadcast_message({
        'type': 'depth',
        'data': depth
    }))
    
    logger.debug(f"Depth: {contract_symbol}")

def on_stream_state_change(state: str):
    """Handle stream state changes."""
    logger.info(f"Stream State Changed: {state}")
    if state == StreamConnectionState.CONNECTED.name:
        logger.info("Stream connected successfully")
    elif state == StreamConnectionState.DISCONNECTED.name:
        logger.warning("Stream disconnected")
    elif state == StreamConnectionState.RECONNECTING.name:
        logger.warning("Stream reconnecting...")

async def initialize_tsx_api():
    """Initialize the TSX API and set up the data stream."""
    global api_client, data_stream
    
    try:
        # Attempt to authenticate with TopStepX API
        logger.info("Authenticating with TopStepX API...")
        api_token = authenticate()
        
        # Create API client and data stream
        api_client = APIClient(token=api_token)
        data_stream = DataStream(api_client)
        
        # Set up callbacks
        data_stream.on_quote = on_quote
        data_stream.on_trade = on_trade
        data_stream.on_depth = on_depth
        data_stream.on_state_change_callback = on_stream_state_change
        
        # Initialize the data stream
        await asyncio.get_event_loop().run_in_executor(None, data_stream.initialize)
        
        # Subscribe to default contracts
        await subscribe_to_default_contracts()
        
        logger.info("TSX API initialized successfully")
        return True
    except (AuthenticationError, ConfigurationError, APIError) as e:
        logger.error(f"TSX API initialization error: {e}")
        return False

async def subscribe_to_default_contracts():
    """Subscribe to a default set of contracts."""
    if not data_stream:
        logger.error("Data stream not initialized")
        return
    
    # Subscribe to each contract in the MARKET_SYMBOLS list
    for symbol, contract_id in MARKET_SYMBOLS.items():
        try:
            # Subscribe to the contract
            await asyncio.get_event_loop().run_in_executor(
                None, 
                lambda: data_stream.subscribe(contract_id)
            )
            
            # Store the contract information
            streaming_contracts[symbol] = contract_id
            
            logger.info(f"Subscribed to {symbol} ({contract_id})")
        except Exception as e:
            logger.error(f"Error subscribing to {symbol} ({contract_id}): {e}")

async def handle_websocket_client(websocket, path):
    """Handle a new WebSocket client connection."""
    # Register the new client
    active_clients.add(websocket)
    client_address = websocket.remote_address
    logger.info(f"New client connected: {client_address}, total clients: {len(active_clients)}")
    
    # Send the current state to the new client
    await websocket.send(json.dumps({
        'type': 'init',
        'data': {
            'markets': list(MARKET_SYMBOLS.keys()),
            'quotes': last_quotes,
            'timestamp': datetime.now().isoformat()
        }
    }))
    
    try:
        # Keep the connection open and handle client messages
        async for message in websocket:
            try:
                data = json.loads(message)
                command = data.get('command')
                
                if command == 'subscribe':
                    symbol = data.get('symbol')
                    if symbol in MARKET_SYMBOLS and symbol not in streaming_contracts:
                        contract_id = MARKET_SYMBOLS[symbol]
                        await asyncio.get_event_loop().run_in_executor(
                            None, 
                            lambda: data_stream.subscribe(contract_id)
                        )
                        streaming_contracts[symbol] = contract_id
                        logger.info(f"Client {client_address} subscribed to {symbol}")
                
                elif command == 'unsubscribe':
                    symbol = data.get('symbol')
                    if symbol in streaming_contracts:
                        contract_id = streaming_contracts[symbol]
                        await asyncio.get_event_loop().run_in_executor(
                            None, 
                            lambda: data_stream.unsubscribe(contract_id)
                        )
                        del streaming_contracts[symbol]
                        logger.info(f"Client {client_address} unsubscribed from {symbol}")
                
            except json.JSONDecodeError:
                logger.warning(f"Received invalid JSON from client {client_address}")
                
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        # Remove the client when they disconnect
        active_clients.discard(websocket)
        logger.info(f"Client disconnected: {client_address}, remaining clients: {len(active_clients)}")

async def main():
    """Main entry point for the application."""
    parser = argparse.ArgumentParser(description="TopStepX Live Data Server")
    parser.add_argument("--port", type=int, default=8765, help="WebSocket server port (default: 8765)")
    parser.add_argument("--host", default="localhost", help="WebSocket server host (default: localhost)")
    args = parser.parse_args()
    
    # Initialize the TSX API
    api_initialized = await initialize_tsx_api()
    if not api_initialized:
        logger.error("Failed to initialize TSX API, exiting")
        return
    
    # Start the WebSocket server
    server_address = args.host if args.host != "localhost" else "127.0.0.1"
    logger.info(f"Starting WebSocket server on {server_address}:{args.port}")
    
    async with websockets.serve(handle_websocket_client, server_address, args.port):
        logger.info(f"WebSocket server running at ws://{server_address}:{args.port}")
        
        # Keep the server running
        while True:
            await asyncio.sleep(1)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Server shutdown requested")
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
    finally:
        # Clean up resources
        if data_stream:
            try:
                data_stream.close()
                logger.info("Data stream closed")
            except:
                pass
        logger.info("Server has shut down")
