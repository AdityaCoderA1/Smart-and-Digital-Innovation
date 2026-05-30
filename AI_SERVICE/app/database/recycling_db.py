"""
GreenLoop Recycling Database — 12 item categories.
Used by recycling_tool.py for fast, cached lookups.
"""

RECYCLING_DATABASE: dict[str, dict] = {

    # ── 1. Plastic Bottle ────────────────────────────────────────────────────
    "plastic bottle": {
        "category": "Plastic Waste",
        "recyclable": True,
        "disposal_method": (
            "Rinse the bottle, remove the cap, and place in the plastic recycling bin. "
            "Most curbside programs accept PET (#1) and HDPE (#2) bottles."
        ),
        "environmental_impact": (
            "Plastic bottles can persist for 450+ years in landfills and break down "
            "into microplastics that harm marine life and enter the food chain."
        ),
    },

    # ── 2. Plastic (general) ─────────────────────────────────────────────────
    "plastic": {
        "category": "Plastic Waste",
        "recyclable": True,
        "disposal_method": (
            "Check the resin code (♳–♷) on the item. Codes #1 and #2 are widely "
            "accepted in curbside bins. Codes #3–#7 usually require a drop-off centre."
        ),
        "environmental_impact": (
            "Single-use plastics are a leading cause of ocean pollution. "
            "Even 'recyclable' plastics have a finite recycling life."
        ),
    },

    # ── 3. Glass Bottle ──────────────────────────────────────────────────────
    "glass bottle": {
        "category": "Glass Waste",
        "recyclable": True,
        "disposal_method": (
            "Rinse well and place in the glass recycling container. "
            "Do not mix with window glass, Pyrex, or ceramics — they melt at different temperatures."
        ),
        "environmental_impact": (
            "Glass is 100 % recyclable indefinitely without quality loss, "
            "saving up to 30 % energy compared to producing new glass."
        ),
    },

    # ── 4. Glass (general) ───────────────────────────────────────────────────
    "glass": {
        "category": "Glass Waste",
        "recyclable": False,
        "disposal_method": (
            "Broken glass or flat glass (windows, mirrors) is NOT accepted in curbside bins. "
            "Wrap securely and take to a specialist glass drop-off or waste transfer station."
        ),
        "environmental_impact": (
            "Improperly disposed glass is a safety hazard and can contaminate "
            "recycling streams, causing entire loads to be landfilled."
        ),
    },

    # ── 5. Battery ───────────────────────────────────────────────────────────
    "battery": {
        "category": "Hazardous Waste",
        "recyclable": True,
        "disposal_method": (
            "Never put batteries in household bins. Drop off at an authorised e-waste "
            "or battery recycling point (many supermarkets and electronics stores accept them)."
        ),
        "environmental_impact": (
            "Batteries contain lead, mercury, cadmium, and lithium — all toxic to "
            "soil and groundwater if landfilled. Recycling recovers valuable metals."
        ),
    },

    # ── 6. E-Waste ───────────────────────────────────────────────────────────
    "e-waste": {
        "category": "Electronic Waste",
        "recyclable": True,
        "disposal_method": (
            "Take to an authorised e-waste collection centre. Many manufacturers and "
            "retailers offer take-back programmes. Erase personal data before drop-off."
        ),
        "environmental_impact": (
            "E-waste is the fastest-growing waste stream globally. Improper disposal "
            "releases lead, mercury, and flame retardants into soil and air."
        ),
    },

    # ── 7. Paper ─────────────────────────────────────────────────────────────
    "paper": {
        "category": "Paper Waste",
        "recyclable": True,
        "disposal_method": (
            "Place dry, clean paper in the paper/cardboard recycling bin. "
            "Shred confidential documents. Avoid recycling wax-coated, greasy, or soiled paper."
        ),
        "environmental_impact": (
            "Recycling one tonne of paper saves 17 trees and 26,000 litres of water. "
            "Paper in landfill produces methane as it decomposes anaerobically."
        ),
    },

    # ── 8. Metal ─────────────────────────────────────────────────────────────
    "metal": {
        "category": "Metal Waste",
        "recyclable": True,
        "disposal_method": (
            "Rinse food cans and place in the metal recycling bin. "
            "Large scrap metal should go to a scrap metal dealer or waste facility. "
            "Aluminium foil can be recycled if scrunched into a ball (golf-ball size)."
        ),
        "environmental_impact": (
            "Recycling aluminium uses 95 % less energy than producing it from ore. "
            "Steel recycling saves significant CO₂ emissions."
        ),
    },

    # ── 9. Food Waste ────────────────────────────────────────────────────────
    "food waste": {
        "category": "Organic Waste",
        "recyclable": False,
        "disposal_method": (
            "Compost food scraps in a home compost bin or use a local food waste "
            "collection service. Avoid composting meat, dairy, and cooked foods in "
            "open heaps — use an enclosed bin or bokashi system instead."
        ),
        "environmental_impact": (
            "Food waste in landfills produces methane, a greenhouse gas 28× more "
            "potent than CO₂. Composting returns nutrients to soil and cuts emissions."
        ),
    },

    # ── 10. Clothing / Textiles ──────────────────────────────────────────────
    "clothing": {
        "category": "Textile Waste",
        "recyclable": True,
        "disposal_method": (
            "Donate wearable items to charity shops or clothes banks. "
            "Worn-out textiles can go to textile recycling banks (many supermarket car parks). "
            "Never put clothing in general recycling bins."
        ),
        "environmental_impact": (
            "The fashion industry accounts for 10 % of global carbon emissions. "
            "Extending garment life by just 9 months reduces its carbon, water, "
            "and waste footprint by 20–30 %."
        ),
    },

    # ── 11. Hazardous Waste ──────────────────────────────────────────────────
    "hazardous": {
        "category": "Hazardous Waste",
        "recyclable": False,
        "disposal_method": (
            "Never pour chemicals down the drain or put in household bins. "
            "Take to your local Household Hazardous Waste (HHW) facility. "
            "Many councils offer free periodic collection events."
        ),
        "environmental_impact": (
            "Hazardous chemicals contaminate groundwater, harm wildlife, and pose "
            "serious public health risks. Correct disposal prevents long-term pollution."
        ),
    },

    # ── 12. Unknown / Fallback ───────────────────────────────────────────────
    "unknown": {
        "category": "Unclassified Waste",
        "recyclable": False,
        "disposal_method": (
            "We couldn't identify this item automatically. Please check your local "
            "council's waste guide or contact your waste management authority for advice."
        ),
        "environmental_impact": (
            "Proper disposal always matters — when in doubt, keep items out of "
            "recycling streams to avoid contamination."
        ),
    },
}
