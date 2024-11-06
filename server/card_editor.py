"""
Use fastui to create a simple web interface for the card editor.
The editor should allow users to create NewCards and publish them to a channel.

Terminal 1:
```bash
docker run --rm -t -p119:119 -p563:563 cclauss/inn
```

Terminal 2:
```bash
pipenv run PYTHONPATH="." python server/card_editor.py
```
"""

from collections.abc import Iterator

from server import ome_node

# import fastui
# from server.schemas import NewCard
# from server.schemas import Card, CardRef, Channel, ChannelSummary, NewCard

nntp_client = ome_node.get_client()
ome_node.enable_a_default_channel("local.test")


sue_grafton_books = {
    "A is for Alibi": 1982,
    "B is for Burglar": 1985,
    "C is for Corpse": 1986,
    "D is for Deadbeat": 1987,
    "E is for Evidence": 1988,
    "F is for Fugitive": 1989,
    "G is for Gumshoe": 1990,
    "H is for Homicide": 1991,
    "I is for Innocent": 1992,
    "J is for Judgment": 1993,
    "K is for Killer": 1994,
    "L is for Lawless": 1995,
    "M is for Malice": 1996,
    "N is for Noose": 1998,
    "O is for Outlaw": 1999,
    "P is for Peril": 2001,
    "Q is for Quarry": 2002,
    "R is for Ricochet": 2004,
    "S is for Silence": 2005,
    "T is for Trespass": 2007,
    "U is for Undertow": 2009,
    "V is for Vengeance": 2011,
    "W is for Wasted": 2013,
    "X": 2015,
    "Y is for Yesterday": 2017,
}


def sample_metadata() -> Iterator[ome_node.Metadata]:
    for title, year in sue_grafton_books.items():
        keyword = title.split()[-1]  # "A is for Alibi" --> "Alibi"
        yield ome_node.Metadata(
            title=title,
            url=f"https://en.wikipedia.org/wiki/{title}".replace(" ", "_"),
            description=f"{title} is a mystery novel by Sue Grafton",
            subject="Mystery",
            author="Sue Grafton",
            alignment_tags=["Mystery", "Sue Grafton", "Kinsey Millhone", keyword],
            keywords=[
                "Mystery",
                "Sue Grafton",
                "Kinsey Millhone",
                f"Books from {year}",
            ],
        )


for metadata in sample_metadata():
    ome_node.create_post(
        ome_node.NewCard(
            channels=["local.test"],
            subject=metadata.title,
            body=metadata,
        ),
    )
for i, card in enumerate(ome_node.channel_cards("local.test", 1, 100), 1):
    print(f"{i:>3}: {card.body = }")


def junk() -> None:
    """
    app = fastui.App()

    channel = fastui.Select(
        "Channel", options=[channel.name for channel in ome_node.channels()]
    )
    subject = fastui.Text("Subject")
    body = fastui.Text("Body")
    submit = fastui.Submit("Submit")
    new_card = fastui.Form("New Card", [channel, subject, body, submit])
    ome_node.create_post(NewCard)
    """
