import qrcode
from pathlib import Path
import webbrowser

# ==========================================
# STATIC QR CODE GENERATOR
# ==========================================

# Create a QR_Codes folder
folder = Path(__file__).parent / "QR_Codes"
folder.mkdir(exist_ok=True)


def create_qr(app_name, url):

    # Create QR code
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=20,
        border=4
    )

    # Add URL
    qr.add_data(url)
    qr.make(fit=True)

    # Generate QR image
    img = qr.make_image(
        fill_color="black",
        back_color="white"
    )

    # File name
    file_path = folder / f"{app_name}.png"

    # Save QR code
    img.save(file_path)

    print()
    print("==========================================")
    print("       QR CODE CREATED SUCCESSFULLY!")
    print("==========================================")
    print()
    print("App:", app_name)
    print("Saved to:")
    print(file_path)
    print()
    print("URL:")
    print(url)
    print()
    print("Type: STATIC QR CODE")
    print("No expiration date.")
    print()

    # Open QR code
    webbrowser.open(file_path.resolve().as_uri())


# ==========================================
# MENU
# ==========================================

while True:

    print()
    print("==========================================")
    print("          QR CODE GENERATOR")
    print("==========================================")
    print("1. Google Reviews")
    print("2. Facebook")
    print("3. Instagram")
    print("4. TikTok")
    print("5. YouTube")
    print("6. Website")
    print("7. Custom QR")
    print("0. Exit")
    print("==========================================")

    choice = input("Choose an option: ").strip()

    # ======================================
    # GOOGLE REVIEWS
    # ======================================

    if choice == "1":

        url = "https://search.google.com/local/writereview?placeid=ChIJsTv1brm1lzMRRXmOlxxSSqc"

        create_qr("google_reviews", url)

    # ======================================
    # FACEBOOK
    # ======================================

    elif choice == "2":

        url = "https://www.facebook.com/brothersramen.mainbranch/reviews"

        if url:
            create_qr("facebook", url)
        else:
            print("URL cannot be empty.")

    # ======================================
    # INSTAGRAM
    # ======================================

    elif choice == "3":

        url = input("Paste Instagram URL: ").strip()

        if url:
            create_qr("instagram", url)
        else:
            print("URL cannot be empty.")

    # ======================================
    # TIKTOK
    # ======================================

    elif choice == "4":

        url = input("Paste TikTok URL: ").strip()

        if url:
            create_qr("tiktok", url)
        else:
            print("URL cannot be empty.")

    # ======================================
    # YOUTUBE
    # ======================================

    elif choice == "5":

        url = input("Paste YouTube URL: ").strip()

        if url:
            create_qr("youtube", url)
        else:
            print("URL cannot be empty.")

    # ======================================
    # WEBSITE
    # ======================================

    elif choice == "6":

        url = input("Paste Website URL: ").strip()

        if url:
            create_qr("website", url)
        else:
            print("URL cannot be empty.")

    # ======================================
    # CUSTOM QR
    # ======================================

    elif choice == "7":

        name = input("Enter QR name: ").strip()
        url = input("Paste URL: ").strip()

        if url:

            if not name:
                name = "custom_qr"

            create_qr(name, url)

        else:
            print("URL cannot be empty.")

    # ======================================
    # EXIT
    # ======================================

    elif choice == "0":

        print("Goodbye!")
        break

    # ======================================
    # INVALID OPTION
    # ======================================

    else:

        print("Invalid option. Choose 0-7.")