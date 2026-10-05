# Customer Churn Analysis (Telco)

Analysis of why telecom customers leave and a model that predicts who will leave next.

## Highlights
- Dataset: Telco Customer Churn, 7,043 customers, 21 columns; overall churn rate 26.5%
- Biggest drivers: month-to-month contract (42.7% churn vs 2.8% on two-year), short tenure (47.4% churn in the first 12 months), fibre optic internet (41.9%), electronic check payment (45.3%), no Online Security or Tech Support (about 42%)
- Best model: Random Forest, ROC-AUC 0.844, recall 0.783, accuracy 0.76
- Targeting the top 20% highest-risk customers captures about 51% of churners

## Folder structure
- `data/` source CSV
- `notebook/Customer_Churn_Analysis.ipynb` full analysis (cleaning, EDA, modelling, evaluation)
- `images/` charts used in the report
- `report/` project report (Word and PDF, 21 pages)
- `scripts/analysis.py` script version of the analysis that generated the charts and numbers

## How to run
```
pip install -r requirements.txt
jupyter notebook notebook/Customer_Churn_Analysis.ipynb
```
Run all cells from top to bottom. Random seed is 42.

## Tools
Python, Pandas, NumPy, Matplotlib, Seaborn, Scikit-learn
