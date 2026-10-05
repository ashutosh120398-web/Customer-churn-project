import pandas as pd, numpy as np, json, matplotlib, warnings
warnings.filterwarnings("ignore")
matplotlib.use("Agg")
import matplotlib.pyplot as plt, seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import *
sns.set_style("whitegrid"); plt.rcParams["figure.dpi"]=110
R={}
df=pd.read_csv("data/Telco-Customer-Churn.csv")
R["rows"],R["cols"]=df.shape
df["TotalCharges"]=pd.to_numeric(df["TotalCharges"].str.strip(),errors="coerce")
R["blank_total"]=int(df.TotalCharges.isna().sum())
df.loc[df.TotalCharges.isna(),"TotalCharges"]=0
R["dups"]=int(df.customerID.duplicated().sum())
df["ChurnFlag"]=(df.Churn=="Yes").astype(int)
R["churn_rate"]=round(df.ChurnFlag.mean()*100,2); R["churned"]=int(df.ChurnFlag.sum())
R["avg_monthly_churn"]=round(df[df.ChurnFlag==1].MonthlyCharges.mean(),2)
R["avg_monthly_stay"]=round(df[df.ChurnFlag==0].MonthlyCharges.mean(),2)
R["med_tenure_churn"]=float(df[df.ChurnFlag==1].tenure.median()); R["med_tenure_stay"]=float(df[df.ChurnFlag==0].tenure.median())
R["monthly_rev_lost"]=round(df[df.ChurnFlag==1].MonthlyCharges.sum(),0)
R["monthly_rev_total"]=round(df.MonthlyCharges.sum(),0)
cats=["gender","SeniorCitizen","Partner","Dependents","PhoneService","MultipleLines","InternetService","OnlineSecurity","OnlineBackup","DeviceProtection","TechSupport","StreamingTV","StreamingMovies","Contract","PaperlessBilling","PaymentMethod"]
rt={}
for c in cats:
    g=df.groupby(c).ChurnFlag.agg(["mean","count"]); rt[c]={str(k):[round(v["mean"]*100,1),int(v["count"])] for k,v in g.iterrows()}
R["rates"]=rt
df["TenureBand"]=pd.cut(df.tenure,[-1,12,24,48,72],labels=["0-12","13-24","25-48","49-72"])
R["tenure_band"]={str(k):round(v*100,1) for k,v in df.groupby("TenureBand",observed=True).ChurnFlag.mean().items()}
df["ChargeBand"]=pd.cut(df.MonthlyCharges,[0,35,70,90,200],labels=["<35","35-70","70-90","90+"])
R["charge_band"]={str(k):round(v*100,1) for k,v in df.groupby("ChargeBand",observed=True).ChurnFlag.mean().items()}
fig,ax=plt.subplots(1,2,figsize=(10,4))
df.Churn.value_counts().plot.pie(autopct="%1.1f%%",ax=ax[0],colors=["#4C9F70","#D1495B"],ylabel="");ax[0].set_title("Churn distribution")
sns.countplot(x="Churn",data=df,ax=ax[1],palette=["#4C9F70","#D1495B"]);ax[1].set_title("Customer count")
plt.tight_layout();plt.savefig("images/01_churn_distribution.png");plt.close()
def rateplot(col,fn,title):
    plt.figure(figsize=(7,4));d=df.groupby(col,observed=True).ChurnFlag.mean().mul(100)
    ax=d.plot.bar(color="#2E5E8C");plt.ylabel("Churn rate (%)");plt.title(title);plt.xticks(rotation=20)
    for i,v in enumerate(d.values): ax.text(i,v+0.6,f"{v:.1f}%",ha="center")
    plt.tight_layout();plt.savefig(fn);plt.close()
rateplot("Contract","images/02_churn_by_contract.png","Churn rate by contract type")
rateplot("InternetService","images/03_churn_by_internet.png","Churn rate by internet service")
rateplot("PaymentMethod","images/04_churn_by_payment.png","Churn rate by payment method")
rateplot("TenureBand","images/05_churn_by_tenure.png","Churn rate by tenure band (months)")
rateplot("TechSupport","images/06_churn_by_techsupport.png","Churn rate by tech support")
rateplot("OnlineSecurity","images/07_churn_by_onlinesecurity.png","Churn rate by online security")
fig,ax=plt.subplots(1,2,figsize=(11,4))
sns.histplot(data=df,x="tenure",hue="Churn",bins=36,multiple="stack",ax=ax[0],palette=["#4C9F70","#D1495B"]);ax[0].set_title("Tenure distribution")
sns.boxplot(data=df,x="Churn",y="MonthlyCharges",ax=ax[1],palette=["#4C9F70","#D1495B"]);ax[1].set_title("Monthly charges vs churn")
plt.tight_layout();plt.savefig("images/08_tenure_charges.png");plt.close()
X=df.drop(columns=["customerID","Churn","ChurnFlag","TenureBand","ChargeBand"])
X=pd.get_dummies(X,drop_first=True); y=df.ChurnFlag
R["n_features"]=X.shape[1]
Xtr,Xte,ytr,yte=train_test_split(X,y,test_size=0.2,stratify=y,random_state=42)
num=["tenure","MonthlyCharges","TotalCharges"]
sc=StandardScaler().fit(Xtr[num])
def scale(d):
    d=d.copy();d[num]=sc.transform(d[num]);return d
Xtr_s,Xte_s=scale(Xtr),scale(Xte)
models={"Logistic Regression":(LogisticRegression(max_iter=2000,class_weight="balanced"),True),
"Decision Tree":(DecisionTreeClassifier(max_depth=5,class_weight="balanced",random_state=42),False),
"Random Forest":(RandomForestClassifier(n_estimators=300,max_depth=8,class_weight="balanced",random_state=42,n_jobs=-1),False),
"Gradient Boosting":(GradientBoostingClassifier(random_state=42),False)}
res={};probs={}
cv=StratifiedKFold(5,shuffle=True,random_state=42)
for n,(m,s) in models.items():
    a,b=(Xtr_s,Xte_s) if s else (Xtr,Xte)
    m.fit(a,ytr);p=m.predict_proba(b)[:,1];pr=(p>=0.5).astype(int);probs[n]=p
    res[n]={"accuracy":accuracy_score(yte,pr),"precision":precision_score(yte,pr),"recall":recall_score(yte,pr),"f1":f1_score(yte,pr),"roc_auc":roc_auc_score(yte,p),
            "cv_auc":cross_val_score(m,a,ytr,cv=cv,scoring="roc_auc").mean()}
    res[n]={k:round(float(v),3) for k,v in res[n].items()}
R["models"]=res
best=max(res,key=lambda k:res[k]["roc_auc"]);R["best"]=best
pl=probs[best];pb=(pl>=0.5).astype(int)
cm=confusion_matrix(yte,pb);R["cm"]=cm.tolist()
plt.figure(figsize=(4.5,4));sns.heatmap(cm,annot=True,fmt="d",cmap="Blues",xticklabels=["Stay","Churn"],yticklabels=["Stay","Churn"]);plt.title(f"Confusion matrix - {best}");plt.xlabel("Predicted");plt.ylabel("Actual");plt.tight_layout();plt.savefig("images/10_confusion_matrix.png");plt.close()
plt.figure(figsize=(6,5))
for n,p in probs.items():
    f,t,_=roc_curve(yte,p);plt.plot(f,t,label=f"{n} ({res[n]['roc_auc']:.3f})")
plt.plot([0,1],[0,1],"k--");plt.xlabel("False positive rate");plt.ylabel("True positive rate");plt.title("ROC curves");plt.legend();plt.tight_layout();plt.savefig("images/09_roc_curves.png");plt.close()
rf=models["Random Forest"][0];imp=pd.Series(rf.feature_importances_,index=X.columns).sort_values(ascending=False).head(12)
R["rf_imp"]={k:round(float(v),3) for k,v in imp.items()}
plt.figure(figsize=(7,5));imp[::-1].plot.barh(color="#2E5E8C");plt.title("Random Forest - top 12 features");plt.tight_layout();plt.savefig("images/11_feature_importance.png");plt.close()
lr=models["Logistic Regression"][0];co=pd.Series(lr.coef_[0],index=X.columns).sort_values()
top=pd.concat([co.head(7),co.tail(7)]);R["lr_coef"]={k:round(float(v),2) for k,v in top.items()}
plt.figure(figsize=(7,5));top.plot.barh(color=["#4C9F70" if v<0 else "#D1495B" for v in top]);plt.title("Logistic Regression coefficients (red = raises churn)");plt.tight_layout();plt.savefig("images/12_lr_coefficients.png");plt.close()
ths=np.arange(0.2,0.81,0.05);tt=[]
for t in ths:
    q=(pl>=t).astype(int);tt.append([round(float(t),2),round(precision_score(yte,q),3),round(recall_score(yte,q),3),round(f1_score(yte,q),3)])
R["threshold"]=tt
plt.figure(figsize=(6,4));arr=np.array(tt);plt.plot(arr[:,0],arr[:,1],label="Precision");plt.plot(arr[:,0],arr[:,2],label="Recall");plt.plot(arr[:,0],arr[:,3],label="F1");plt.xlabel("Threshold");plt.legend();plt.title("Threshold trade-off");plt.tight_layout();plt.savefig("images/13_threshold.png");plt.close()
te=pd.DataFrame({"p":pl,"y":yte.values,"m":df.loc[Xte.index,"MonthlyCharges"].values}).sort_values("p",ascending=False)
k=int(len(te)*0.2);R["top20_capture"]=round(te.y.head(k).sum()/te.y.sum()*100,1);R["top20_monthly"]=round(float(te.m.head(k).sum()),0)
plt.figure(figsize=(5,4));sns.heatmap(df[["tenure","MonthlyCharges","TotalCharges","ChurnFlag"]].corr(),annot=True,cmap="coolwarm",fmt=".2f");plt.title("Correlation");plt.tight_layout();plt.savefig("images/14_correlation.png");plt.close()
R["corr_tenure"]=round(df.tenure.corr(df.ChurnFlag),2);R["corr_monthly"]=round(df.MonthlyCharges.corr(df.ChurnFlag),2)
json.dump(R,open("results.json","w"),indent=1,default=float)
print(json.dumps(R,indent=1,default=float))
