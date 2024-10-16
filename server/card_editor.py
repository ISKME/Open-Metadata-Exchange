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

import fastui

# import nntp
from server import ome_node
from server.schemas import NewCard

# from server.schemas import Card, CardRef, Channel, ChannelSummary, NewCard

nntp_client = ome_node.get_client()
ome_node.enable_a_default_channel("local.test")

app = fastui.App()

channel = fastui.Select(
    "Channel", options=[channel.name for channel in ome_node.channels()]
)
subject = fastui.Text("Subject")
body = fastui.Text("Body")
submit = fastui.Submit("Submit")
new_card = fastui.Form("New Card", [channel, subject, body, submit])
ome_node.create_post(NewCard)
for card in ome_node.channel_cards(channel, 0, 10):
    print(f"{card = }")
    card_ref = fastui.Text(str(card))
    app.add(card_ref)
