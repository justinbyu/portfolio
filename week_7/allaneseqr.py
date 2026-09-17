import qrcode
from pathlib import Path

# ==========================================
# ALLANESE AESTHETICS
# UNIVERSAL STATIC FACEBOOK REVIEW QR
# Works with Android + iPhone
# ==========================================

# Facebook Reviews link
url = "https://www.facebook.com/allaneseyeshivabeautyclinic.ctac/reviews"

# Create QR_Codes folder in the same folder as this script
folder = Path(__file__).parent / "QR_Codes"
folder.mkdir(exist_ok=True)

# Create QR code
qr = qrcode.QRCode(
    version=None,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=30,
    border=5
)

# Add the URL
qr.add_data(url)
qr.make(fit=True)

# Generate black & white QR
img = qr.make_image(
    fill_color="black",
    back_color="white"
)

# Save the QR
output = folder / "allanesse_facebook_reviews_universal.png"
img.save(output)

print("==========================================")
print("QR CODE CREATED SUCCESSFULLY!")
print("==========================================")
print(f"Saved to: {output}")
print("")
print("Works with:")
print("✓ Android")
print("✓ iPhone")
print("✓ Google Lens")
print("✓ Phone Camera QR Scanner")
print("")
print("Type: STATIC QR CODE")
print("No monthly subscription required.")