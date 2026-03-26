from playwright.sync_api import sync_playwright
import time
import os

def run_cuj(page):
    print("Navigating to app...")
    page.goto("http://localhost:3000")
    page.wait_for_timeout(2000)

    # Take screenshot of login screen to verify the hardcoded admin@oss.com is not pre-filled
    # and the app loads correctly
    print("Taking screenshot of login...")
    page.screenshot(path="/home/jules/verification/screenshots/login.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    os.makedirs("/home/jules/verification/videos", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
            print("Done!")
