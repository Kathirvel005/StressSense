# StressSense

**AI-Based Human Stress Prediction System**

Live Demo: [http://stresssense-kaviraj.surge.sh/](http://stresssense-kaviraj.surge.sh/)

StressSense is a premium, web-based intelligence platform designed to predict human stress levels early. Using a Random Forest classifier, it analyzes physical, psychological, environmental, academic, and social variables to identify primary risk factors.

## Features
- **Early AI Stress Prediction**: Powered by a Python/Flask microservice trained with Random Forest classifiers.
- **Microservices Architecture**: React/Vite client-side UI connecting to a Spring Boot Java core and a Flask ML engine.
- **Interactive Vitals Dashboard**: Track sleep quality, anxiety levels, headache frequency, blood pressure, and breathing patterns.
- **Offline Fallback / Demo Mode**: Runs standalone in the browser using localized client-side prediction heuristics if the backend service is offline.
