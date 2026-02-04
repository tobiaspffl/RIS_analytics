# Visualization 4: Interactive Map (Basic Frequency)
# -------------------------------------------------------------
# ZIEL: Interaktive Karte, die zeigt, wo die politische "Musik" spielt.
# TECHNIK: Wir nutzen 'folium' (Leaflet.js Wrapper).
# VORGEHEN: Da wir keine Shapefiles haben, nutzen wir approximierte Zentrumskoordinaten für die Viertel.

# 1. Imports checken
try:
    import folium
except ImportError:
    print("Folium is not installed. Installing now...")
    %pip install folium
    import folium
from folium import DivIcon

# 2. Koordinaten-Wörterbuch für Münchner Stadtteile (Manuell gepflegt für die wichtigsten)
# Format: "Name": [Lat, Lon]
district_coords = {
    "Altstadt": [48.137, 11.575], "Lehel": [48.139, 11.590],
    "Ludwigsvorstadt": [48.131, 11.556], "Isarvorstadt": [48.128, 11.564],
    "Maxvorstadt": [48.149, 11.565], "Schwabing": [48.170, 11.585],
    "Freimann": [48.195, 11.615], "Au": [48.125, 11.588],
    "Haidhausen": [48.131, 11.605], "Sendling": [48.118, 11.545],
    "Westpark": [48.119, 11.516], "Schwanthalerhöhe": [48.138, 11.540],
    "Westend": [48.136, 11.540], "Neuhausen": [48.156, 11.536],
    "Nymphenburg": [48.158, 11.503], "Moosach": [48.181, 11.507],
    "Milbertshofen": [48.183, 11.566], "Am Hart": [48.196, 11.569],
    "Bogenhausen": [48.157, 11.638], "Berg am Laim": [48.128, 11.637],
    "Trudering": [48.125, 11.666], "Riem": [48.135, 11.700],
    "Ramersdorf": [48.114, 11.616], "Perlach": [48.095, 11.630],
    "Obergiesing": [48.110, 11.580], "Untergiesing": [48.110, 11.566],
    "Harlaching": [48.091, 11.566], "Untermenzing": [48.176, 11.474],
    "Allach": [48.193, 11.460], "Pasing": [48.147, 11.462],
    "Obermenzing": [48.163, 11.463], "Laim": [48.137, 11.494],
    "Hadern": [48.115, 11.480], "Lochhausen": [48.168, 11.408],
    "Langwied": [48.181, 11.423], "Aubing": [48.154, 11.414],
    "Thalkirchen": [48.100, 11.545], "Obersendling": [48.098, 11.535],
    "Forstenried": [48.085, 11.493], "Fürstenried": [48.077, 11.478],
    "Solln": [48.079, 11.528], "Feldmoching": [48.214, 11.531],
    "Hasenbergl": [48.213, 11.555],
    "Freiham": [48.140, 11.405], "Neuperlach": [48.094, 11.649]
}


# Visualization 5: Interactive Map with Normalized Party Metrics (Concept 1: Fair Share)
# -------------------------------------------------------------
# TARGET: Map showing how intensively parties care about districts RELATIVE to their total activity.
# BENEFIT: Corrects "Size Bias" (Greens have 10x more motions than small parties -> used to be dominant everywhere).
# TECHNIQUE: Folium Map with custom SVG Pie Charts as markers.

import folium
from folium.plugins import MarkerCluster
from folium import DivIcon
import math

# 1. Helper Function: SVG Pie Chart Generator
def create_pie_chart_svg(data_series, colors, size=30):
    """
    Creates an SVG string for a pie chart.
    data_series: Pandas Series with values between 0 and 1 (Sum should be 1)
    colors: Dictionary with party colors
    size: Diameter of the icon in pixels
    """
    radius = size / 2
    cx = radius
    cy = radius
    
    svg_elements = []
    start_angle = 0 # Start at 12 o'clock
    
    # Filter and Sort
    data = data_series[data_series > 0.01].copy() # Ignore slices < 1% for performance
    
    # If no data, gray circle
    if data.empty:
        return f'<svg width="{size}" height="{size}"><circle cx="{cx}" cy="{cy}" r="{radius}" fill="#ccc"/></svg>'

    cumulative_share = 0
    
    for party, share in data.items():
        color = colors.get(party, "#888888")
        
        # Calculate angle
        angle = share * 360
        
        # Special case: Almost 100%
        if share > 0.99:
            svg_elements.append(f'<circle cx="{cx}" cy="{cy}" r="{radius}" fill="{color}" />')
            break
            
        # Calculate end angle
        end_angle = start_angle + angle
        
        # Calculate coordinates (Angle in radians, -90 degree offset so 0 is top)
        x1 = cx + radius * math.cos(math.radians(start_angle - 90))
        y1 = cy + radius * math.sin(math.radians(start_angle - 90))
        x2 = cx + radius * math.cos(math.radians(end_angle - 90))
        y2 = cy + radius * math.sin(math.radians(end_angle - 90))
        
        # SVG Path command
        large_arc = 1 if angle > 180 else 0
        
        path_d = f"M {cx} {cy} L {x1} {y1} A {radius} {radius} 0 {large_arc} 1 {x2} {y2} Z"
        svg_elements.append(f'<path d="{path_d}" fill="{color}" stroke="white" stroke-width="0.5"/>')
        
        start_angle = end_angle

    svg_content = "".join(svg_elements)
    # Drop shadow filter for better visibility
    return f'''
    <svg width="{size}" height="{size}" viewBox="0 0 {size} {size}" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.3));">
        {svg_content}
    </svg>
    '''

party_colors = {
    "CSU": "#000000",   # Black
    "The Greens": "#46962b", # Green
    "SPD": "#E3000F",   # Red
    "FDP": "#FFED00",   # Yellow
    "The Left": "#BE3075", # Magenta
    "ÖDP": "#FF6600"    # Orange
}

# 3. Data Preparation "Fair Share"
print("Calculating normalized party scores...")

if 'Parties_List' in df_content.columns and 'Mentioned_Districts' in df_content.columns:
    # Explode
    df_map_data = df_content.explode('Mentioned_Districts').explode('Parties_List')
    
    # Filter
    relevant_parties = list(party_colors.keys())
    df_map_data = df_map_data[df_map_data['Parties_List'].isin(relevant_parties)]
    
    # Crosstab: Rows=Districts, Cols=Parties
    ct_counts = pd.crosstab(df_map_data['Mentioned_Districts'], df_map_data['Parties_List'])
    
    # Only Top X Districts with enough data
    total_db_mentions = ct_counts.sum(axis=1)
    relevant_districts = total_db_mentions[total_db_mentions >= 3].index # Min. 3 mentions
    ct_counts = ct_counts.loc[relevant_districts]
    
    # STEP 1: Column Normalization (Activity Focus)
    # Removes the influence of party size.
    # "What percentage of THEIR attention does Party X devote to District Y?"
    party_totals = ct_counts.sum(axis=0)
    ct_norm_col = ct_counts.div(party_totals, axis=1)
    
    # STEP 2: Row Normalization (Pie Slices)
    # "Of the aggregated 'attention' placed on the district - who has the largest share?"
    pie_data = ct_norm_col.div(ct_norm_col.sum(axis=1), axis=0)
    
    # 4. Generate Map
    m5 = folium.Map(location=[48.137, 11.575], zoom_start=11, tiles="CartoDB positron")
    
    placed_count = 0
    
    for district in pie_data.index:
        coords = None
        # Coordinate Search
        if district in district_coords:
            coords = district_coords[district]
        else:
            for k, v in district_coords.items():
                if k in district or district in k:
                    coords = v
                    break
        
        if coords:
            # Data for this district
            shares = pie_data.loc[district]
            raw_count = total_db_mentions.loc[district]
            
            # Dynamic Size based on TOTAL relevance
            # Log scale for readability
            marker_size = 20 + math.log(raw_count) * 8
            if marker_size > 80: marker_size = 80
            
            # Create SVG
            svg_icon = create_pie_chart_svg(shares, party_colors, size=marker_size)
            
            # Popup Text Generation (English)
            popup_html = f"<b>{district}</b><br><u>Fair Share (Normalized):</u><br>"
            # Sort for popup by share
            for p, s in shares.sort_values(ascending=False).items():
                if s > 0.05: # Only > 5% in text
                    popup_html += f"{p}: {s:.1%}<br>"
            
            popup_html += f"<br>Total Mentions: {int(raw_count)}"

            # Add Marker
            folium.Marker(
                location=coords,
                icon=DivIcon(
                    html=svg_icon,
                    icon_size=(marker_size, marker_size),
                    icon_anchor=(marker_size/2, marker_size/2)
                ),
                popup=folium.Popup(popup_html, max_width=250)
            ).add_to(m5)
            
            # Add Label (Text)
            folium.Marker(
                location=coords,
                icon=DivIcon(
                    icon_size=(100, 20),
                    icon_anchor=(50, -marker_size/2 + 5), 
                    html=f'<div style="font-size: 8pt; text-align: center; font-weight: bold; color: #333; text-shadow: 1px 1px 0px white;">{district}</div>'
                )
            ).add_to(m5)
            
            placed_count += 1
            
    # Add Legend (English)
    legend_html = '''
     <div style="position: fixed; 
     bottom: 50px; left: 50px; width: 160px; height: auto; 
     border:2px solid grey; z-index:9999; font-size:12px;
     background-color:white; opacity:0.9; padding: 10px;">
     <b>Party Legend</b><br>
     '''
    
    for party, color in party_colors.items():
        legend_html += f'<i style="background:{color};width:10px;height:10px;float:left;margin-right:5px;margin-top:2px;"></i> {party}<br>'
        
    legend_html += '</div>'
    m5.get_root().html.add_child(folium.Element(legend_html))
            
    print(f"Visualized {placed_count} districts with 'Fair Share' Pie-Charts.")
    
    # Save
    output_file = "munich_districts_fairshare_map.html"
    m5.save(output_file)
    print(f"Map saved as: {output_file}")
    
    # Display
    try:
        display(m5)
    except:
        pass

else:
    print("Required data ('Parties_List', 'Mentioned_Districts') missing. Please run previous cells.")