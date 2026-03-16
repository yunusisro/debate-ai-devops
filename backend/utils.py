from bson import ObjectId
from typing import Any, Dict

def serialize_mongo_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert MongoDB document to JSON-serializable format"""
    if doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc

def validate_object_id(id_string: str) -> bool:
    """Validate if string is a valid MongoDB ObjectId"""
    try:
        ObjectId(id_string)
        return True
    except Exception:
        return False
