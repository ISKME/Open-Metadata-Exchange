#!/usr/bin/env -S uv run --script

# /// script
# requires-python = ">=3.13"
# dependencies = [
#   "beautifulsoup4",
#   "httpx",
# ]
# ///

"""
Make data about Lansing, Michigan from World Historical Gazetteer and Michigan Memories
available to teachers as they create lesson plans in the OER Commons Editor.

queries:
* whg Lansing, Michigan
* michmemories Lansing river images
* worldbank Health Service Delivery

On macOS, /usr/bin/open will open images in the default image viewer.
"""

import asyncio

import httpx
from bs4 import BeautifulSoup


def dbpedia(page: str) -> str:
    soup = BeautifulSoup(page, "html.parser")
    return soup.find("span", {"property": "dbo:abstract", "lang": "en"}).text


def decolonialatlas(page: str) -> str:
    page = "\n".join(line for line in page.splitlines() if "Lansing" in line)
    return BeautifulSoup(page, "html.parser").text


def getty(page: str) -> str:
    """
    <TD COLSPAN=5><SPAN CLASS=page><BR><B>Note: </B>Located on Grand river where it
    joins the Red Cedar river; site was wilderness in 1847 when state capital was moved
    here; grew with arrival of railroad & development of motor industry in 1880s; now
    produces automobiles.</SPAN></TD></TR>
    """
    page = "\n".join(line for line in page.splitlines() if "<B>Note: </B>" in line)
    return BeautifulSoup(page, "html.parser").text


async def fetch_text(url: str) -> str:
    async with httpx.AsyncClient() as httpx_async_client:
        try:
            response = await httpx_async_client.get(url).check_for_status()
        except httpx.HTTPStatusError:
            print(f"Failed to fetch {url}: {response.status_code}")
            raise


async def whgazetteer() -> None:
    urls = (
        # "https://michmemories.org/exhibits/default/catalog?q=lansing",
        # "https://whgazetteer.org/places/14156749/portal",
        (
            "https://www.getty.edu/vow/TGNFullDisplay?find=Michigan&place=&nation="
            "&prev_page=1&english=Y&subjectid=2052433"
        ),
        "https://decolonialatlas.wordpress.com/turtle-island-decolonized/",
        # "https://dbpedia.org/page/Lansing,_Michigan",
    )

    tasks = [fetch_text(url) for url in urls]
    results = await asyncio.gather(*tasks)

    funcs = {func.__name__: func for func in (decolonialatlas, dbpedia, getty)}
    for url, result in zip(urls, results, strict=True):
        if result:
            for func_name, func in funcs.items():
                if func_name in url:
                    result = func(result)  # noqa: PLW2901
                    break
            print(f"Text from {url}:\n\n{result}\n\n{'=' * 50}\n")
        else:
            print(f"Failed to fetch text from {url}")


if __name__ == "__main__":
    # from pathlib import Path
    from subprocess import CalledProcessError, run
    from time import sleep
    from webbrowser import open_new_tab

    # Type: whg Lansing, Michigan
    print("whg: World Historical Gazetteer")
    print("michmem: Michigan Memories\n")
    print("worldbank: World Bank on DSpace\n")
    _ = input("Search: (ex. 'whg Canada') ")
    sleep(2)

    print(
        "2 World Historical Gazetteer datasets found: Getty, Decolonial Atlas, "
        "DBpedia\n",
    )
    open_new_tab("https://whgazetteer.org/places/14156749/portal")
    print("Parsing 3 sources...\n")
    sleep(2)
    asyncio.run(whgazetteer())

    # Type: michmem Lansing river images
    _ = input("Search: (ex. 'whg Canada') ")
    # https://michmemories.org/exhibits/timber-tales-lumbering-and-lumber-camps
    print("Michigan Memories selected: Lansing river\n")
    open_new_tab(
        "https://michmemories.org/search?keywords=Lansing+river",
    )
    sleep(2)
    try:
        run("/usr/bin/open *.jpg", shell=True, check=True)  # noqa: S602
    except CalledProcessError as e:
        print(f"Error opening local images: {e}")
    # for i, image_file in enumerate(Path(__file__).glob("*.jpg")):
    #    print(f"Opening {image_file}...")
    #    sleep(1)
    #    run(["/usr/bin/open", image_file])

    # Type: worldbank Health Service Delivery
    #
    _ = input("Search: (ex. 'whg Canada') ")
    print(
        "1 Worldbank pdf file: The Power of Data Collection on Health Service Delivery"
        "\n",
    )
    open_new_tab(
        "https://openknowledge.worldbank.org/bitstreams/a34428a8-81c0-4c98-88b8-a5637bc5fde8/download",
    )
    # sleep(2)
    # run("/usr/bin/open *.jpg", shell=True)
    # for i, image_file in enumerate(Path(__file__).glob("*.jpg")):
    #    print(f"Opening {image_file}...")
    #    sleep(1)
    #    run(["/usr/bin/open", image_file])
