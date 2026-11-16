from fastapi import FastAPI, File, UploadFile, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from PIL import Image
import os
import shutil
import uuid

app = FastAPI(title="File Upload API")

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

# Mount Static and uploads folders
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/uploads", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

# HTML ROUTE
@app.get("/", response_class=HTMLResponse)
async def get_upload_page(request: Request):
    return templates.TemplateResponse(request, "index.html")

# UPLOAD ENDPOINT
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    # 1. Vaildate file type (only allow images for this project)
    if not file.content_type.startswith("image/"):
        raise HTTPException (status_code=400, detail="Only image files are allowed!")

    # 2. Generate a unique filename to prevent overwriting
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
    file_path = f"uploads/{unique_filename}"

    # 3. Save the file temporarily
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 4. Process the image (Resize it to max 500px width/height)
    try:
        img = Image.open(file_path)
        img.thumbnail(500, 500)
        img.save(file_path)
    except Exception as e:
        os.remove(file_path) # Clean up if image processing fails
        raise HTTPException(status_code=500, detail="Error processing image")

    # Return the URL to the uploaded file
    return {
        "filename": unique_filename,
        "url": f"/uploads/{unique_filename}"
        "message": "Upload successful and image resized."
    }