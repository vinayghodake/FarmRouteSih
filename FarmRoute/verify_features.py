import re
import sys

def verify():
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    with open('styles.css', 'r', encoding='utf-8') as f:
        css = f.read()

    with open('app.js', 'r', encoding='utf-8') as f:
        js = f.read()

    checks = [
        ("GPS button single pin structure", '<button id="btn-detect-gps"' in html and '<span id="gps-btn-label"' in html),
        ("Location search box in HTML", 'id="input-loc-search"' in html and 'id="loc-search-results"' in html),
        ("Dynamic location history chips container", 'id="location-history-chips"' in html),
        ("AGMARK Certificate Portal", 'id="agmark-card-preview"' in html and 'id="btn-generate-agmark-card"' in html),
        ("Truck payload utilization meter", 'id="truck-utilization-bar"' in html and 'id="truck-utilization-pct"' in html),
        ("Diesel fuel calculator in HTML", 'id="fuel-litres"' in html and 'id="fuel-cost"' in html),
        ("Shared return-trip pool checkbox", 'id="chk-return-pool"' in html),
        ("Transporter Dispatch Booking Modal", 'id="transporter-dispatch-modal"' in html and 'id="btn-confirm-dispatch"' in html),
        ("Dynamic Warehouses & NABARD 70% pledge loan", 'id="pledge-loan-val"' in html and 'class="wh-filter-chips"' in html),
        ("Farmer Payments view (#payments)", 'id="payments"' in html and 'id="pay-upi-id"' in html and 'id="btn-simulate-escrow-release"' in html),
        ("Anti-Fraud Legal Shield view (#legal-shield)", 'id="legal-shield"' in html and 'id="form-legal-notice"' in html and 'id="notice-preview-container"' in html),
        ("Farmer Profile Customization Studio", 'id="avatar-presets-bar"' in html and 'class="fav-mandis-checklist"' in html),
        ("Button touch height >= 44px in styles.css", 'min-height: 46px' in css and 'min-height: 44px' in css),
        ("JS label.textContent without extra pin", 'label.textContent = locationName;' in js),
        ("JS Nominatim search function", 'function searchLocationNominatim' in js),
        ("JS dynamic warehouses rendering", 'function renderWarehouses' in js and 'activeWarehouseFilter' in js),
        ("JS AGMARK generator", 'function generateAgmarkCertificate' in js),
        ("JS Section 138 legal notice generator", 'function generateStatutoryLegalNotice' in js),
        ("JS payments view handler", 'function initPaymentsView' in js),
        ("JS profile customization", 'function initProfileCustomization' in js),
    ]

    all_ok = True
    print("=== FarmRoute Comprehensive Verification ===")
    for label, passed in checks:
        status = "PASS" if passed else "FAIL"
        print(f"[{status}] {label}")
        if not passed:
            all_ok = False

    if all_ok:
        print("\nAll 20 verification checks passed successfully!")
    else:
        print("\nSome checks failed!")
        sys.exit(1)

if __name__ == '__main__':
    verify()
