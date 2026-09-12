import qrcode
from pathlib import Path
import os


# ==========================================
# QR CODE GENERATOR
# ==========================================

# Create a folder called QR_Codes
output_folder = Path(__file__).parent / "QR_Codes"
output_folder.mkdir(exist_ok=True)


def create_qr(name, url):
    """Create and automatically open a static QR code."""

    # Create QR
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=12,
        border=4
    )

    # Add URL
    qr.add_data(url)
    qr.make(fit=True)

    # Create image
    img = qr.make_image(
        fill_color="black",
        back_color="white"
    )

    # Save image
    filename = output_folder / f"{name}.png"
    img.save(filename)

    print()
    print("==========================================")
    print("       QR CODE CREATED SUCCESSFULLY!")
    print("==========================================")
    print()
    print(f"Saved to: {filename}")
    print(f"URL: {url}")
    print()

    # Automatically open the QR image
    os.startfile(filename)


# ==========================================
# MAIN PROGRAM
# ==========================================

while True:

    print("\n================================")
    print("        QR CODE GENERATOR")
    print("================================")
    print("1. Facebook Reviews")
    print("2. Google Reviews")
    print("3. Instagram")
    print("4. TikTok")
    print("5. Website")
    print("6. Custom QR")
    print("7. Exit")
    print("================================")

    choice = input("Choose an option: ")

    # Facebook
    if choice == "1":

        url = input("\nEnter Facebook Reviews URL: ")

        create_qr(
            "facebook_reviews",
            url
        )

    # Google
    elif choice == "2":

        url = input("\nEnter Google Reviews URL:https://search.google.com/local/writereview?placeid=ChIJsTv1brm1lzMRRXmOlxxSSqc ")

        create_qr(
            "google_reviews",
            url
        )

    # Instagram
    elif choice == "3":

        url = input("\nEnter Instagram URL: ")

        create_qr(
            "instagram",
            url
        )

    # TikTok
    elif choice == "4":

        url = input("\nEnter TikTok URL: ")

        create_qr(
            "tiktok",
            url
        )

    # Website
    elif choice == "5":

        url = input("\nEnter Website URL: ")

        create_qr(
            "website",
            url
        )

    # Custom
    elif choice == "6":

        name = input("\nEnter QR name: ")
        url = input("Enter URL: ")

        create_qr(
            name,
            url
        )

    # Exit
    elif choice == "7":

        print("\nGoodbye!")
        break

    else:

        print("\n❌ Invalid option. Please choose 1-7.")