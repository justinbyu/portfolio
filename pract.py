import qrcode
import os

print("================================")
print("       QR CODE GENERATOR")
print("================================")

# Ask for the URL
url = input("Paste your URL here:https://search.google.com/local/writereview?placeid=ChIJsTv1brm1lzMRRXmOlxxSSqc ").strip()

# Ask for the QR name
name = input("Enter QR name:Google Review ").strip()

# Create QR code
qr = qrcode.QRCode(
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,
    border=4
)

qr.add_data(url)
qr.make(fit=True)

# Create QR image
image = qr.make_image(
    fill_color="black",
    back_color="white"
)

# Save the QR image
filename = name + ".png"
image.save(filename)

print()
print("================================")
print("       QR CODE CREATED!")
print("================================")
print("Saved as:", filename)
print("URL:", url)

# Automatically open the QR picture
os.startfile(os.path.abspath(filename))

print()
print("QR picture opened!")