from app.database.recycling_db import RECYCLING_DATABASE

def recycling_tool(item: str):
    result = RECYCLING_DATABASE.get(item.lower())
    if result:
        return result
    return {
        "category": "Unknown Waste",
        "recyclable": False,
        "disposal_method": "Consult local recycling authority",
        "environmental_impact": "Unknown environmental impact"
    }
