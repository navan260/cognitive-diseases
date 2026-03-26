import os
from pypdf import PdfReader

def extract_text_from_pdf(file_path):
    """
    Extracts text from a PDF file using pypdf.
    """
    if not os.path.exists(file_path):
        return "Error: File not found."

    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        
        if not text.strip():
            return "Error: Could not extract any text from the PDF. It might be scanned or empty."
            
        return text
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return f"Error extracting text from PDF: {str(e)}"
