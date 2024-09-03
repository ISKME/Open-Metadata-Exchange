#!/usr/bin/env python3
"""
Import FastAPI and use it retrieve multiple different resources
1. An image from https://michmemories.org
2. A dataset from https://github.com/WorldHistoricalGazetteer
3. A pdf file from https://openknowledge.worldbank.org/pages/sustainable-development-goals
"""

from typing import Annotated

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
import httpx

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/login/")
async def login(username: Annotated[str, Form()], password: Annotated[str, Form()]):
    return {"username": username}


@app.get("/image")
async def image() -> bytes:
    """
    Retrieve an image from https://michmemories.org
    """
    image_url = "https://digitalcollections.detroitpubliclibrary.org/islandora/object/islandora%3A236607/datastream/IMAGE/view"
    image = await httpx.get(image_url)
    if image.status_code == 200:
        return image.content
    raise HTTPException(status_code=404, detail="Image not found")


@app.get("/dataset")
async def dataset():
    """
    Retrieve a dataset from https://github.com/WorldHistoricalGazetteer
    """
    return {"message": "This is a dataset"}


@app.get("/pdf")
async def pdf():
    """
    Retrieve a pdf file from https://openknowledge.worldbank.org/pages/sustainable-development-goals
    """
    return {"message": "This is a pdf"}


@app.post("/files/")
async def create_file(file: Annotated[bytes, File()]):
    return {"file_size": len(file)}


@app.post("/uploadfile/")
async def create_upload_file(file: UploadFile):
    return {"filename": file.filename}
