import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Optional
from ..config.chroma_settings import (
    CHROMA_HOST, CHROMA_PORT, CHROMA_COLLECTION_NAME, 
    EMBEDDING_MODEL, CHROMA_CLIENT_TYPE
)

class VectorService:
    def __init__(self):
        # Use HTTP client to connect to separate ChromaDB container
        if CHROMA_CLIENT_TYPE == "http":
            self.client = chromadb.HttpClient(
                host=CHROMA_HOST,
                port=CHROMA_PORT
            )
        else:
            # Fallback for development
            self.client = chromadb.PersistentClient(path="./chroma_db")
            
        self.collection = self.client.get_or_create_collection(name=CHROMA_COLLECTION_NAME)
        self.embedding_model = SentenceTransformer(EMBEDDING_MODEL)
    
    def add_content(self, content_id: str, text: str, metadata: Dict):
        """Add content to vector store"""
        embedding = self.embedding_model.encode([text])
        self.collection.add(
            documents=[text],
            embeddings=embedding.tolist(),
            metadatas=[metadata],
            ids=[content_id]
        )
    
    def search(self, query: str, n_results: int = 5, filter_metadata: Optional[Dict] = None):
        """Search for similar content"""
        query_embedding = self.embedding_model.encode([query])
        results = self.collection.query(
            query_embeddings=query_embedding.tolist(),
            n_results=n_results,
            where=filter_metadata
        )
        return results
    
    def delete_content(self, content_id: str):
        """Delete content from vector store"""
        try:
            self.collection.delete(ids=[content_id])
        except Exception as e:
            print(f"Error deleting content {content_id}: {e}")
    
    def update_content(self, content_id: str, text: str, metadata: Dict):
        """Update existing content"""
        self.delete_content(content_id)
        self.add_content(content_id, text, metadata)