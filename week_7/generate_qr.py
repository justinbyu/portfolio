import qrcode
from pathlib import Path

print("=" * 45)
print("       LIFETIME QR CODE GENERATOR")
print("=" * 45)

# Ask for the website/link
url = input("\nEnter the link you want to turn into a QR code: ").strip()

if not url:
    print("❌ No link entered.")
    exit()

# Ask for a file name
name = input("Enter QR file name (example: facebook_review): ").strip()

if not name:
    name = "my_qr_code"

# Create QR code
qr = qrcode.QRCode(
    version=None,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=12,
    border=4
)

qr.add_data(url)
qr.make(fit=True)

# Generate image
img = qr.make_image(
    fill_color="black",
    back_color="white"
)

# Save in the same folder as this Python program
folder = Path(__file__).parent
file_path = folder / f"{name}.png"

img.save(file_path)

print("\n✅ QR CODE CREATED!")
print(f"📁 Saved to: {file_path}")
print(f"🔗 Link: {url}")
print("\nThis is a STATIC QR code.")
print("It does not have an expiration date.")