"""
DOCUMENT PROCESSOR - Universal Document Upload & Analysis API
Handles file uploads, extraction, and AI-powered analysis for all seven domains
Security: File validation, size limits, sanitization
Storage: Organized by domain and analysis type
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from datetime import datetime
import hashlib
import mimetypes
from pathlib import Path
import re

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_EXTENSIONS = {
    'pdf', 'doc', 'docx', 'txt', 'rtf',  # Documents
    'eml', 'msg',  # Email
    'csv', 'xlsx', 'xls',  # Spreadsheets
    'jpg', 'jpeg', 'png', 'gif',  # Images
    'mp3', 'wav', 'm4a',  # Audio
    'json', 'xml'  # Structured data
}

# Domain mapping
DOMAIN_TOOLS = {
    'legal': ['CONTRACT_ANALYZER', 'EMAIL_ANALYZER', 'ARGUMENT_MAPPER', 'TIMELINE_PROJECTOR'],
    'business': ['NEGOTIATION_ANALYZER', 'SALES_PITCH_DETECTOR', 'FINANCIAL_DECISION_CHECKER'],
    'digital': ['SYSTEM_HEALTH_MONITOR', 'ARCHITECTURE_SIMULATOR'],
    'healthcare': ['MEDICAL_RECORD_ANALYZER', 'TREATMENT_PLAN_ANALYZER'],
    'communication': ['MEETING_ANALYZER', 'CONVERSATION_ANALYZER', 'GASLIGHTING_DETECTOR'],
    'showcase': ['PATTERN_LIBRARY'],
    'transparency': ['SOURCE_VERIFIER', 'TRUTH_SIGNAL_FINDER']
}

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def sanitize_filename(filename):
    """Sanitize filename to prevent directory traversal and other attacks"""
    # Remove path components
    filename = os.path.basename(filename)
    # Remove non-alphanumeric characters except dots, dashes, underscores
    filename = re.sub(r'[^\w\s.-]', '', filename)
    # Replace spaces with underscores
    filename = filename.replace(' ', '_')
    return filename

def generate_file_hash(file_content):
    """Generate SHA256 hash of file content"""
    return hashlib.sha256(file_content).hexdigest()

def extract_text_from_file(filepath, file_extension):
    """Extract text content from various file types"""
    text = ""
    
    try:
        if file_extension == 'txt':
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read()
        
        elif file_extension == 'pdf':
            try:
                import PyPDF2
                with open(filepath, 'rb') as f:
                    pdf_reader = PyPDF2.PdfReader(f)
                    for page in pdf_reader.pages:
                        text += page.extract_text() + "\n"
            except ImportError:
                text = "[PDF extraction requires PyPDF2 library]"
        
        elif file_extension in ['doc', 'docx']:
            try:
                import docx
                doc = docx.Document(filepath)
                text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            except ImportError:
                text = "[DOCX extraction requires python-docx library]"
        
        elif file_extension == 'eml':
            try:
                import email
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    msg = email.message_from_file(f)
                    text = f"From: {msg.get('From')}\n"
                    text += f"To: {msg.get('To')}\n"
                    text += f"Subject: {msg.get('Subject')}\n"
                    text += f"Date: {msg.get('Date')}\n\n"
                    if msg.is_multipart():
                        for part in msg.walk():
                            if part.get_content_type() == "text/plain":
                                text += part.get_payload(decode=True).decode('utf-8', errors='ignore')
                    else:
                        text += msg.get_payload(decode=True).decode('utf-8', errors='ignore')
            except Exception as e:
                text = f"[Email parsing error: {str(e)}]"
        
        elif file_extension == 'json':
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                text = json.dumps(data, indent=2)
        
        elif file_extension in ['csv', 'xlsx', 'xls']:
            try:
                import pandas as pd
                if file_extension == 'csv':
                    df = pd.read_csv(filepath)
                else:
                    df = pd.read_excel(filepath)
                text = df.to_string()
            except ImportError:
                text = "[Spreadsheet extraction requires pandas library]"
        
    except Exception as e:
        text = f"[Error extracting text: {str(e)}]"
    
    return text

def analyze_document_patterns(text, domain, tool):
    """Analyze document for manipulation patterns and insights"""
    analysis = {
        'word_count': len(text.split()),
        'char_count': len(text),
        'patterns_detected': [],
        'risk_indicators': [],
        'recommendations': []
    }
    
    # Pattern detection keywords by domain
    legal_red_flags = [
        'non-negotiable', 'as-is', 'no warranty', 'unlimited liability',
        'perpetual license', 'exclusive rights', 'waive all claims',
        'indemnify', 'hold harmless', 'at sole discretion'
    ]
    
    manipulation_patterns = [
        'you always', 'you never', 'everyone knows', 'nobody believes',
        'if you really loved', 'after all I\'ve done', 'you\'re too sensitive',
        'you\'re overreacting', 'you\'re crazy', 'that never happened',
        'you\'re remembering wrong'
    ]
    
    business_red_flags = [
        'limited time offer', 'act now', 'don\'t miss out', 'guaranteed',
        'risk-free', 'once in a lifetime', 'exclusive opportunity',
        'secret strategy', 'proven system', 'no experience needed'
    ]
    
    text_lower = text.lower()
    
    # Domain-specific analysis
    if domain == 'legal':
        for flag in legal_red_flags:
            if flag in text_lower:
                analysis['risk_indicators'].append({
                    'type': 'legal_red_flag',
                    'pattern': flag,
                    'severity': 'high',
                    'description': f'Found potentially problematic clause: "{flag}"'
                })
    
    if domain in ['communication', 'legal', 'business']:
        for pattern in manipulation_patterns:
            if pattern in text_lower:
                analysis['patterns_detected'].append({
                    'type': 'manipulation',
                    'pattern': pattern,
                    'category': 'gaslighting/emotional_manipulation',
                    'description': f'Detected manipulation pattern: "{pattern}"'
                })
    
    if domain == 'business':
        for flag in business_red_flags:
            if flag in text_lower:
                analysis['risk_indicators'].append({
                    'type': 'sales_pressure',
                    'pattern': flag,
                    'severity': 'medium',
                    'description': f'High-pressure sales tactic detected: "{flag}"'
                })
    
    # Generate recommendations
    if analysis['risk_indicators']:
        analysis['recommendations'].append('Review flagged sections carefully with legal counsel')
    if analysis['patterns_detected']:
        analysis['recommendations'].append('Consider the emotional manipulation patterns detected')
    if analysis['word_count'] > 10000:
        analysis['recommendations'].append('This is a lengthy document - consider section-by-section review')
    
    # Calculate risk score
    risk_score = min(100, (len(analysis['risk_indicators']) * 15) + (len(analysis['patterns_detected']) * 10))
    analysis['risk_score'] = risk_score
    
    if risk_score < 25:
        analysis['risk_level'] = 'low'
    elif risk_score < 60:
        analysis['risk_level'] = 'medium'
    else:
        analysis['risk_level'] = 'high'
    
    return analysis

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'DOCUMENT_PROCESSOR',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """
    Upload and process a document
    Expected form data:
    - file: The file to upload
    - domain: Domain the tool belongs to (legal, business, etc.)
    - tool: Tool name (CONTRACT_ANALYZER, etc.)
    - analysis_type: Type of analysis to perform (optional)
    """
    
    # Check if file is present
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Get metadata
    domain = request.form.get('domain', 'general')
    tool = request.form.get('tool', 'UNKNOWN')
    analysis_type = request.form.get('analysis_type', 'standard')
    
    # Validate file
    if not allowed_file(file.filename):
        return jsonify({
            'error': 'File type not allowed',
            'allowed_types': list(ALLOWED_EXTENSIONS)
        }), 400
    
    # Read file content
    file_content = file.read()
    
    # Check file size
    if len(file_content) > MAX_FILE_SIZE:
        return jsonify({
            'error': 'File too large',
            'max_size_mb': MAX_FILE_SIZE / (1024 * 1024)
        }), 400
    
    # Sanitize filename
    original_filename = file.filename
    safe_filename = sanitize_filename(original_filename)
    file_extension = safe_filename.rsplit('.', 1)[1].lower()
    
    # Generate unique filename with hash
    file_hash = generate_file_hash(file_content)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    unique_filename = f"{timestamp}_{file_hash[:8]}_{safe_filename}"
    
    # Create domain-specific directory
    domain_folder = os.path.join(UPLOAD_FOLDER, domain, tool)
    os.makedirs(domain_folder, exist_ok=True)
    
    # Save file
    filepath = os.path.join(domain_folder, unique_filename)
    with open(filepath, 'wb') as f:
        f.write(file_content)
    
    # Extract text content
    extracted_text = extract_text_from_file(filepath, file_extension)
    
    # Analyze document
    analysis = analyze_document_patterns(extracted_text, domain, tool)
    
    # Create response
    response = {
        'success': True,
        'file_info': {
            'original_name': original_filename,
            'saved_name': unique_filename,
            'size_bytes': len(file_content),
            'size_kb': round(len(file_content) / 1024, 2),
            'type': file_extension,
            'mime_type': mimetypes.guess_type(original_filename)[0],
            'hash': file_hash,
            'uploaded_at': datetime.now().isoformat(),
            'domain': domain,
            'tool': tool
        },
        'extracted_text': extracted_text[:1000] + ('...' if len(extracted_text) > 1000 else ''),
        'text_length': len(extracted_text),
        'analysis': analysis,
        'storage_path': filepath
    }
    
    # Save metadata
    metadata_file = filepath + '.meta.json'
    with open(metadata_file, 'w') as f:
        json.dump(response, f, indent=2)
    
    return jsonify(response)

@app.route('/api/analyze-text', methods=['POST'])
def analyze_text():
    """
    Analyze text without file upload
    Expected JSON:
    - text: The text to analyze
    - domain: Domain context
    - tool: Tool name
    """
    data = request.get_json()
    
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
    
    text = data.get('text', '')
    domain = data.get('domain', 'general')
    tool = data.get('tool', 'UNKNOWN')
    
    if len(text) == 0:
        return jsonify({'error': 'Empty text'}), 400
    
    # Analyze the text
    analysis = analyze_document_patterns(text, domain, tool)
    
    return jsonify({
        'success': True,
        'text_preview': text[:200] + ('...' if len(text) > 200 else ''),
        'analysis': analysis,
        'analyzed_at': datetime.now().isoformat()
    })

@app.route('/api/domains', methods=['GET'])
def get_domains():
    """Get list of supported domains and their tools"""
    return jsonify({
        'domains': DOMAIN_TOOLS,
        'supported_file_types': list(ALLOWED_EXTENSIONS)
    })

@app.route('/api/files/<domain>/<tool>', methods=['GET'])
def list_files(domain, tool):
    """List uploaded files for a specific domain/tool"""
    domain_folder = os.path.join(UPLOAD_FOLDER, domain, tool)
    
    if not os.path.exists(domain_folder):
        return jsonify({
            'files': [],
            'message': 'No files uploaded yet'
        })
    
    files = []
    for filename in os.listdir(domain_folder):
        if filename.endswith('.meta.json'):
            continue
        
        filepath = os.path.join(domain_folder, filename)
        stat = os.stat(filepath)
        
        files.append({
            'name': filename,
            'size_bytes': stat.st_size,
            'uploaded_at': datetime.fromtimestamp(stat.st_mtime).isoformat()
        })
    
    return jsonify({
        'domain': domain,
        'tool': tool,
        'files': files,
        'count': len(files)
    })

if __name__ == '__main__':
    print("=" * 60)
    print("DOCUMENT PROCESSOR API")
    print("=" * 60)
    print(f"Upload folder: {UPLOAD_FOLDER}")
    print(f"Max file size: {MAX_FILE_SIZE / (1024 * 1024)} MB")
    print(f"Allowed extensions: {', '.join(ALLOWED_EXTENSIONS)}")
    print("=" * 60)
    print("Endpoints:")
    print("  GET  /api/health - Health check")
    print("  POST /api/upload - Upload and analyze document")
    print("  POST /api/analyze-text - Analyze text without upload")
    print("  GET  /api/domains - List supported domains")
    print("  GET  /api/files/<domain>/<tool> - List uploaded files")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5555, debug=True)
