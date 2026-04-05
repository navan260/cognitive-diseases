# Import the Pinecone library
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
import os
import uuid

load_dotenv()

# Initialize a Pinecone client with your API key
api_key = os.getenv('PINECONE_USER_KEY')
pc = Pinecone(api_key=api_key)

index_name = "face-db"

def init_db():
    if not api_key:
        print("Warning: PINECONE_USER_KEY not found in environment variables.")
        return None

    try:
        # Check if the index exists, create it if it doesn't
        if not pc.has_index(index_name):
            pc.create_index(
                name=index_name,
                vector_type="dense",
                dimension=128,  # dlib face encodings are 128-dimensional
                metric="euclidean", # face_recognition uses euclidean distance
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"
                ),
                deletion_protection="disabled",
            )
        return pc.Index(index_name)
    except Exception as e:
        print(f"Error initializing Pinecone index: {e}")
        return None

index = init_db()

def add_face(name, encoding, namespace=""):
    """
    Saves a face encoding and associated name to Pinecone.
    """
    if index is None:
        raise Exception("Database not initialized. Please ensure your PINECONE_USER_KEY is correct.")
        
    # Convert numpy array to standard Python list for JSON serialization
    encoding_list = encoding.tolist() if hasattr(encoding, 'tolist') else encoding
    
    # Generate a unique ID for this face record
    face_id = str(uuid.uuid4())
    
    payload = {
        "id": face_id,
        "values": encoding_list,
        "metadata": {
            "name": name
        }
    }
    
    index.upsert(vectors=[payload], namespace=namespace)
    return True

def query_face(encoding, namespace="", tolerance=10.0):
    """
    Queries Pinecone for the closest matching face.
    If the match distance is within 'tolerance', returns the name.
    """
    if index is None:
        raise Exception("Database not initialized. Please ensure your PINECONE_USER_KEY is correct.")
        
    encoding_list = encoding.tolist() if hasattr(encoding, 'tolist') else encoding
    
    response = index.query(
        vector=encoding_list,
        top_k=1,
        include_metadata=True,
        namespace=namespace
    )
    
    if response and response.get('matches'):
        best_match = response['matches'][0]
        # For euclidean metric in Pinecone, the 'score' returned is the squared distance.
        # So we square our tolerance threshold for comparison.
        if best_match['score'] <= (tolerance * tolerance):
            return best_match['metadata'].get('name', 'Unknown Name')
            
    return "Unknown Person"