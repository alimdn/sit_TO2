import sys

# Read the base64 data
with open('/home/z/my-project/download/templates/thumb.b64', 'r') as f:
    thumb_b64 = f.read().strip()
with open('/home/z/my-project/download/templates/hero.b64', 'r') as f:
    hero_b64 = f.read().strip()
with open('/home/z/my-project/download/templates/preview.b64', 'r') as f:
    preview_b64 = f.read().strip()

# Read the HTML file
with open('/home/z/my-project/download/webflowsub-templates.html', 'r') as f:
    html = f.read()

# Replace placeholders
html = html.replace('THUMB_PLACEHOLDER', thumb_b64)
html = html.replace('HERO_PLACEHOLDER', hero_b64)
html = html.replace('PREVIEW_PLACEHOLDER', preview_b64)

# Write back
with open('/home/z/my-project/download/webflowsub-templates.html', 'w') as f:
    f.write(html)

print("Done! All 3 images embedded successfully.")
print(f"Thumb: {len(thumb_b64)} chars")
print(f"Hero: {len(hero_b64)} chars")
print(f"Preview: {len(preview_b64)} chars")
