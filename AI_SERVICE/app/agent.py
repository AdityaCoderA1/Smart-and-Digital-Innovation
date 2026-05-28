from app.tools.recycling_tool import recycling_tool
from app.models.waste_model import WasteResponse

def recycling_agent(item: str):
    tool_result = recycling_tool(item)
    response = WasteResponse(
        waste_type=item,
        category=tool_result["category"],
        recyclable=tool_result["recyclable"],
        disposal_method=tool_result["disposal_method"],
        environmental_impact=tool_result["environmental_impact"]
    )
    return response
