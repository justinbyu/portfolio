import qrcode
from pathlib import Path

# ==========================================
# ALLANESE AESTHETICS FACEBOOK REVIEW QR
# ==========================================

# Facebook Reviews URL
url = "https://www.facebook.com/allaneseyeshivabeautyclinic.ctac/reviews"

# Create QR code
qr = qrcode.QRCode(
    version=None,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=12,
    border=4
)

# Add the URL
qr.add_data(url)
qr.make(fit=True)

# Generate QR image
img = qr.make_image(
    fill_color="black",
    back_color="white"
)

# Save QR code in the same folder as this Python file
folder = Path(__file__).parent
file_path = folder / "allanesse_facebook_reviews.png"

img.save(file_path)

# Show confirmation
print()
print("==========================================")
print("       QR CODE CREATED SUCCESSFULLY!")
print("==========================================")
print()
print(f"Saved to:")
print(file_path)
print()
print("Facebook Reviews:")
print(url)
print()
print("This is a STATIC QR code.")
print("It does not have an expiration date.")
print()