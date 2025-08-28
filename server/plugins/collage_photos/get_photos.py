# /// script
# requires-python = ">=3.13"
# dependencies = [
#   "beautifulsoup4",
#   "httpx",
# ]
# ///

import asyncio
from collections.abc import AsyncGenerator
from pathlib import Path

import httpx
from bs4 import BeautifulSoup

PLUGIN_NAME = "college_photos"
IMAGE_DIR = Path(__file__).parent / "college_photos_images"
SEARCH_URL = "https://completecollegephotolibrary.org/?s=laptop"
NUM_IMAGES = 10


async def fetch_image_urls(
    query_url: str = SEARCH_URL, max_images: int = NUM_IMAGES
) -> AsyncGenerator[str, None]:
    """Yield image URLs from the query results page."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(query_url)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        images = soup.find_all("img")
        count = 0
        for img in images:
            src = img.get("src")
            if (
                src
                and "collegephotolibrary.org" in src
                and src.lower().endswith((".jpg", ".jpeg", ".png"))
            ):
                yield src
                count += 1
            if count >= max_images:
                break


async def download_images(
    image_urls: list[str], dest_dir: Path = IMAGE_DIR
) -> list[str]:
    """Download images to the destination directory asynchronously."""
    dest_dir.mkdir(parents=True, exist_ok=True)

    async def download_one(i: int, url: str) -> str | None:
        try:
            (resp := await client.get(url, timeout=10)).raise_for_status()
            ext = Path(url).suffix or ".jpg"
            filename = f"college_photo_{i + 1:07_}{ext}"
            path = dest_dir / filename
            path.write_bytes(resp.content)
            return str(path)
        except Exception as ex:  # noqa: BLE001
            print(f"Failed to download {url}: {ex}")
            return None

    async with httpx.AsyncClient() as client:
        tasks = [download_one(i, url) for i, url in enumerate(image_urls)]
        results = await asyncio.gather(*tasks)
        return [result for result in results if result]
    return None


async def create_college_photos_from_laptop_query() -> list[str]:
    """Main entry point: fetch and save 10 images from the laptop query."""
    return await download_images([url async for url in fetch_image_urls()])


if __name__ == "__main__":
    results = asyncio.run(create_college_photos_from_laptop_query())
    print("Downloaded images:", results)
