#!/usr/bin/env python3
"""
Builds King_Arcega.vcf  (vCard 3.0, UTF-8, properly line-folded).

Edit the CONTACT dict below and re-run:  python3 tools/build-vcard.py
Run from the arcega folder (where index.html lives).
"""

import base64
import datetime
import os
import textwrap

CONTACT = {
    "first": "King",
    "last": "Arcega",
    "full": "King Arcega",
    "org": "theshop101.ph",
    "title": "Affiliate Marketing Creator",
    "email": "theshop101.ph@gmail.com",
    # Leave as "" if you ever want to remove the phone number.
    # Format for PH numbers: +639XXXXXXXXX  (no spaces, no leading 0)
    "tel": "",
    "street": "55 G Marcelo Street, Maysan",
    "city": "Valenzuela City",
    "region": "Metro Manila",
    "postal": "",
    "country": "Philippines",
    "urls": [
        "https://www.tiktok.com/@theshop101ph",
        "https://www.facebook.com/share/1Cko11JjHw/",
        "https://www.instagram.com/theshop101.ph",
    ],
    "note": "Affiliate Marketing Creator - theshop101.ph. TikTok & Facebook: @theshop101ph",
    # Small square JPEG that will show up inside the saved contact on
    # iPhone + Android. Keep it under ~140 KB (iOS rejects huge embedded photos).
    "photo": "images/contact-photo.jpg",
    "output": "King_Arcega.vcf",
}

MAX_OCTETS = 75


def fold(line: str) -> str:
    """RFC 2426 / 6350 line folding: max 75 octets, continuation lines
    start with a single space. All of our content is ASCII except the
    base64 photo, so len() == octets here."""
    if len(line.encode("utf-8")) <= MAX_OCTETS:
        return line
    parts = []
    # first chunk: 75 chars
    parts.append(line[:MAX_OCTETS])
    rest = line[MAX_OCTETS:]
    # continuation chunks: 1 space + 74 chars = 75
    for chunk in textwrap.wrap(rest, MAX_OCTETS - 1, drop_whitespace=False,
                               break_long_words=True, break_on_hyphens=False):
        parts.append(" " + chunk)
    return "\r\n".join(parts)


def build(c: dict) -> str:
    lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        f"N:{c['last']};{c['first']};;;",
        f"FN:{c['full']}",
        f"ORG:{c['org']}",
        f"TITLE:{c['title']}",
        f"EMAIL;TYPE=INTERNET,WORK:{c['email']}",
    ]
    if c["tel"]:
        lines.append(f"TEL;TYPE=CELL,VOICE:{c['tel']}")
    lines.append(
        "ADR;TYPE=WORK:;;{street};{city};{region};{postal};{country}".format(**c)
    )
    lines.extend(f"URL:{u}" for u in c["urls"])
    if c["note"]:
        lines.append(f"NOTE:{c['note']}")

    if c["photo"] and os.path.exists(c["photo"]):
        with open(c["photo"], "rb") as fh:
            b64 = base64.b64encode(fh.read()).decode("ascii")
        lines.append("PHOTO;ENCODING=b;TYPE=JPEG:" + b64)

    stamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    lines.append(f"REV:{stamp}")
    lines.append("END:VCARD")
    return "\r\n".join(fold(x) for x in lines) + "\r\n"


if __name__ == "__main__":
    data = build(CONTACT)
    with open(CONTACT["output"], "w", encoding="utf-8", newline="") as fh:
        fh.write(data)
    print(f"wrote {CONTACT['output']}  ({len(data.encode('utf-8'))} bytes)")
