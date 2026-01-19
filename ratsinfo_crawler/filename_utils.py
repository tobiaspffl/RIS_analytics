"""
Utility functions for converting filenames to Windows-compatible format.

Handles special characters (ä, ö, ü, ß, commas, backslashes, colons, etc.)
and ensures saved files can be stored and accessed on Windows systems.
"""

import unicodedata
import re


def sanitize_filename(filename: str) -> str:
    r"""
    Convert a filename to a Windows-compatible format.
    
    Replaces problematic characters with sensible alternatives:
    - German umlauts: ä→ae, ö→oe, ü→ue, ß→ss
    - Special chars: / → -, : → -, * → -, ? → -, " → '', \ → -
    - Leading/trailing spaces and dots are removed
    - Multiple consecutive underscores/dashes are collapsed to single char
    
    Args:
        filename (str): Original filename with potentially problematic characters
        
    Returns:
        str: Windows-compatible filename
    """
    # Explicit mappings for German umlauts and special characters
    replacements = {
        'ä': 'ae',
        'ö': 'oe',
        'ü': 'ue',
        'ß': 'ss',
        'Ä': 'Ae',
        'Ö': 'Oe',
        'Ü': 'Ue',
        
    }
    
    # Apply explicit replacements
    for old, new in replacements.items():
        filename = filename.replace(old, new)
    
    # Remove or replace Windows-forbidden characters
    # Forbidden in Windows: < > : " / \ | ? *
    forbidden_chars = {
        '<': '',
        '>': '',
        ':': '-',
        '"': '',
        '/': '-',
        '\\': '-',
        '|': '-',
        '?': '',
        '*': '',
    }
    
    for old, new in forbidden_chars.items():
        filename = filename.replace(old, new)
    
    # Normalize Unicode characters (decompose accented characters)
    filename = unicodedata.normalize('NFKD', filename)
    
    # Remove any remaining non-ASCII characters that didn't decompose
    filename = filename.encode('ascii', 'ignore').decode('ascii')
    
    # Replace multiple consecutive spaces, underscores, or dashes with single character
    filename = re.sub(r'_+', '_', filename)
    filename = re.sub(r'-+', '-', filename)
    filename = re.sub(r' +', ' ', filename)
    
    # Remove leading and trailing whitespace, dots, and dashes
    filename = filename.strip('. -_')
    
    # Ensure filename is not empty
    if not filename:
        filename = 'document'
    
    return filename


def sanitize_path_and_filename(full_path: str) -> str:
    """
    Sanitize both directory path and filename components.
    
    Args:
        full_path (str): Full file path
        
    Returns:
        str: Full path with sanitized filename
    """
    # Split path and filename
    parts = full_path.rsplit('/', 1)
    
    if len(parts) == 2:
        directory, filename = parts
        sanitized_filename = sanitize_filename(filename)
        return f'{directory}/{sanitized_filename}'
    else:
        # No directory separator found, just sanitize the whole thing
        return sanitize_filename(full_path)


# Example usage in download_pdf function:
# Instead of:
#   file_path = f'{path}/{name.replace(' ', '_')}.pdf'
# Use:
#   file_path = f'{path}/{sanitize_filename(name)}.pdf'

