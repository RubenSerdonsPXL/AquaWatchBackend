from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

import pickle

app = FastAPI()

# Define the list of allowed origins (you can add more origins as needed)
origins = [
    "*"
]

# Add CORS middleware to your FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

with open('./pickle/water_hyacinth_model.pkl', 'rb') as f:
    model = pickle.load(f)

class PredictionRequest(BaseModel):
    windspeed: float
    winddir: float

async def predict_hyacinth(windspeed: float, winddir: float):
    prediction = model.predict([[windspeed, winddir]])
    prediction_result = prediction.tolist()

    return {"prediction": prediction_result}

# Endpoint for prediction
# Body must look like this:
# {
#     "windspeed": 10.0,
#     "winddir": 270.0
# }
# url: http://localhost:8000/predict_hyacinth/
# POST method

@app.post("/predict_hyacinth/")
async def predict(prediction_request: PredictionRequest):
    print("Processing prediction request...")
    return await predict_hyacinth(prediction_request.windspeed, prediction_request.winddir)

