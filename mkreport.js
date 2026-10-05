const fs=require('fs');const d=require('docx');
const {Document,Packer,Paragraph,TextRun,ImageRun,Table,TableRow,TableCell,WidthType,ShadingType,AlignmentType,HeadingLevel,LevelFormat,PageBreak,TableOfContents,Footer,PageNumber,BorderStyle}=d;
const R=JSON.parse(fs.readFileSync('results.json'));const dims=JSON.parse(fs.readFileSync('dims.json'));
const W=9026;
const P=(t,o={})=>new Paragraph({spacing:{after:140,line:300},alignment:o.align||AlignmentType.JUSTIFIED,...o.p,children:[new TextRun({text:t,size:22,font:"Calibri",bold:o.bold,italics:o.it})]});
const H1=t=>new Paragraph({heading:HeadingLevel.HEADING_1,pageBreakBefore:true,children:[new TextRun(t)]});
const H2=t=>new Paragraph({heading:HeadingLevel.HEADING_2,children:[new TextRun(t)]});
const B=t=>new Paragraph({numbering:{reference:"b",level:0},spacing:{after:80,line:290},children:[new TextRun({text:t,size:22,font:"Calibri"})]});
const IMG=(f,w,cap)=>{const [pw,ph]=dims[f];const h=Math.round(w*ph/pw);return [new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:120,after:60},children:[new ImageRun({type:"png",data:fs.readFileSync('images/'+f),transformation:{width:w,height:h},altText:{title:cap,description:cap,name:f}})]}),new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:200},children:[new TextRun({text:cap,italics:true,size:19,color:"555555"})]})]};
const bd={style:BorderStyle.SINGLE,size:4,color:"BBBBBB"};const borders={top:bd,bottom:bd,left:bd,right:bd};
const TBL=(hdr,rows,cw)=>{const cell=(t,w,h)=>new TableCell({borders,width:{size:w,type:WidthType.DXA},shading:{fill:h?"1F3A5F":"FFFFFF",type:ShadingType.CLEAR},margins:{top:70,bottom:70,left:100,right:100},children:[new Paragraph({children:[new TextRun({text:String(t),size:20,font:"Calibri",bold:h,color:h?"FFFFFF":"000000"})]})]});
return new Table({width:{size:W,type:WidthType.DXA},columnWidths:cw,rows:[new TableRow({tableHeader:true,children:hdr.map((t,i)=>cell(t,cw[i],true))}),...rows.map(r=>new TableRow({children:r.map((t,i)=>cell(t,cw[i],false))}))]})};
const sp=()=>new Paragraph({spacing:{after:160},children:[]});
const m=R.models, rt=R.rates, cm=R.cm;
const tn=cm[0][0],fp=cm[0][1],fn=cm[1][0],tp=cm[1][1];
const body=[];
// cover
body.push(new Paragraph({spacing:{before:2600,after:200},alignment:AlignmentType.CENTER,children:[new TextRun({text:"CUSTOMER CHURN ANALYSIS",bold:true,size:56,font:"Calibri",color:"1F3A5F"})]}));
body.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:200},children:[new TextRun({text:"Identifying Why Telecom Customers Leave and Predicting Who Will Leave Next",size:28,font:"Calibri",color:"444444"})]}));
body.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:600,after:80},children:[new TextRun({text:"Project Report",size:30,bold:true,font:"Calibri"})]}));
body.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:80},children:[new TextRun({text:"Tools: Python (Pandas, NumPy, Matplotlib, Seaborn, Scikit-learn)",size:22,font:"Calibri"})]}));
body.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:80},children:[new TextRun({text:"Dataset: Telco Customer Churn (7,043 customers)",size:22,font:"Calibri"})]}));
body.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:1200},children:[new TextRun({text:"Prepared by: Ashutosh Kumar Singh",size:26,bold:true,font:"Calibri"})]}));
body.push(new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"October 2026",size:22,font:"Calibri"})]}));
// toc
body.push(new Paragraph({pageBreakBefore:true,heading:HeadingLevel.HEADING_1,children:[new TextRun("Table of Contents")]}));
["1. Executive Summary","2. Introduction","3. Dataset Description","4. Data Cleaning and Preparation","5. Exploratory Data Analysis","6. Predictive Modelling","7. What Drives Churn?","8. Threshold Tuning and Business Impact","9. Recommendations","10. Limitations and Future Work","11. Conclusion","Appendix A: Project Files and Reproduction","Appendix B: Tools and Libraries"].forEach(t=>body.push(P(t,{align:AlignmentType.LEFT,p:{spacing:{after:120}}})));
// 1
body.push(H1("1. Executive Summary"));
body.push(P(`Customer churn, the loss of customers who stop using a service, is one of the most costly problems for subscription businesses such as telecom providers. Winning a new customer usually costs far more than keeping an existing one, so even a small drop in churn has a large effect on revenue. This project analyses a telecom dataset of ${R.rows.toLocaleString()} customers to find out why customers leave and to build a model that predicts which customers are most likely to leave.`));
body.push(P(`The overall churn rate is ${R.churn_rate}% (${R.churned.toLocaleString()} customers). Churned customers pay more on average (${R.avg_monthly_churn} per month on average versus ${R.avg_monthly_stay} for customers who stayed) and leave early, with a median tenure of ${R.med_tenure_churn} months compared with ${R.med_tenure_stay} months for loyal customers. The monthly revenue linked to churned customers is ${R.monthly_rev_lost.toLocaleString()} out of a total of ${R.monthly_rev_total.toLocaleString()}, which is about ${(R.monthly_rev_lost/R.monthly_rev_total*100).toFixed(1)}% of monthly revenue.`));
body.push(P("Key findings:",{bold:true}));
body.push(B(`Contract type is the strongest driver. Month-to-month customers churn at ${rt.Contract["Month-to-month"][0]}%, one-year customers at ${rt.Contract["One year"][0]}% and two-year customers at only ${rt.Contract["Two year"][0]}%.`));
body.push(B(`New customers are at the highest risk: ${R.tenure_band["0-12"]}% of customers in their first 12 months churn, versus ${R.tenure_band["49-72"]}% of those with more than four years of tenure.`));
body.push(B(`Fibre optic customers churn at ${rt.InternetService["Fiber optic"][0]}%, more than double the ${rt.InternetService.DSL[0]}% of DSL customers.`));
body.push(B(`Customers paying by electronic check churn at ${rt.PaymentMethod["Electronic check"][0]}%, around three times the rate of customers on automatic payments.`));
body.push(B(`Customers without Online Security (${rt.OnlineSecurity.No[0]}%) or Tech Support (${rt.TechSupport.No[0]}%) churn far more than those who have these services (${rt.OnlineSecurity.Yes[0]}% and ${rt.TechSupport.Yes[0]}%).`));
body.push(B(`Four models were compared. Random Forest performed best overall with ROC-AUC of ${m["Random Forest"].roc_auc}, recall of ${m["Random Forest"].recall} and accuracy of ${m["Random Forest"].accuracy}. Targeting the top 20% highest-risk customers captures ${R.top20_capture}% of all churners.`));
// 2
body.push(H1("2. Introduction"));
body.push(H2("2.1 Background"));
body.push(P("Telecom is a highly competitive industry. Customers can switch providers easily, and many offers are available at similar prices. Because acquiring a new subscriber costs several times more than retaining an existing one, telecom companies track churn closely and invest in retention campaigns. A retention team has limited budget and time, so it needs to know which customers are most at risk and why, instead of offering discounts to everyone."));
body.push(H2("2.2 Problem statement"));
body.push(P("The company is losing about one in four customers. The business needs to understand which customer characteristics are linked to leaving, how much revenue is at risk, and how to identify at-risk customers early enough for the retention team to act."));
body.push(H2("2.3 Objectives"));
["Clean and prepare the customer dataset for analysis.","Perform exploratory data analysis to find the patterns that separate churned customers from loyal customers.","Quantify churn across contract, services, billing, demographics and tenure.","Build and compare machine learning models that predict churn.","Choose a sensible decision threshold for a retention team and estimate how well the model targets churners.","Give clear, practical recommendations to reduce churn."].forEach(t=>body.push(B(t)));
body.push(H2("2.4 Scope"));
body.push(P("The analysis uses a single snapshot of customer data. It does not include call-centre logs, network quality measurements or competitor pricing, so the findings describe associations in the available data and not proven causes."));
// 3
body.push(H1("3. Dataset Description"));
body.push(P(`The Telco Customer Churn dataset contains ${R.rows.toLocaleString()} rows (one per customer) and ${R.cols} columns. The target column is Churn, which says whether the customer left within the last month. The columns fall into four groups: customer demographics, services subscribed, account and billing information, and the churn label.`));
body.push(TBL(["Group","Columns","Description"],[
["Identifier","customerID","Unique ID of the customer (not used for modelling)"],
["Demographics","gender, SeniorCitizen, Partner, Dependents","Basic customer profile"],
["Account","tenure, Contract, PaperlessBilling, PaymentMethod","Months with the company, contract term, billing method"],
["Phone services","PhoneService, MultipleLines","Phone line subscriptions"],
["Internet services","InternetService, OnlineSecurity, OnlineBackup, DeviceProtection, TechSupport, StreamingTV, StreamingMovies","Internet type and add-on services"],
["Charges","MonthlyCharges, TotalCharges","Current monthly bill and total billed to date"],
["Target","Churn","Yes if the customer left, No otherwise"]],[1800,3626,3600]));
body.push(sp());
body.push(P(`The dataset is imbalanced: ${R.churn_rate}% of customers churned and ${(100-R.churn_rate).toFixed(2)}% stayed. This matters for modelling, because a model that predicts "stay" for everyone would still be about ${(100-R.churn_rate).toFixed(0)}% accurate while being useless to a retention team. For this reason, recall, precision, F1 and ROC-AUC are used alongside accuracy.`));
body.push(...IMG("01_churn_distribution.png",520,"Figure 1: Distribution of churned and retained customers"));
// 4
body.push(H1("4. Data Cleaning and Preparation"));
body.push(H2("4.1 Data quality checks"));
body.push(B(`Duplicates: ${R.dups} duplicate customer IDs were found, so no rows were removed.`));
body.push(B(`TotalCharges was read as text because ${R.blank_total} rows contained blank values. All of these customers have tenure 0, which means they had just signed up and had not been billed. The column was converted to numeric and the blanks were set to 0.`));
body.push(B("SeniorCitizen is stored as 0/1 while other yes/no columns use text. It was kept as a binary feature."));
body.push(B("Several service columns contain 'No internet service' or 'No phone service'. These were kept as their own category because they carry information (customers with no internet churn very little)."));
body.push(H2("4.2 Feature engineering and encoding"));
body.push(P(`Categorical variables were converted to numeric form using one-hot encoding with the first category dropped to avoid redundancy. This gave ${R.n_features} model features. Tenure and charge bands were created for the exploratory analysis only (tenure: 0-12, 13-24, 25-48, 49-72 months; monthly charges: under 35, 35-70, 70-90, above 90).`));
body.push(H2("4.3 Train/test split and scaling"));
body.push(P("The data was split 80/20 into training and test sets using stratified sampling so that both sets keep the same churn rate. The three numeric columns (tenure, MonthlyCharges, TotalCharges) were standardised for logistic regression. The scaler was fitted on the training data only, which prevents information from the test set leaking into the model. Tree-based models do not need scaling and were trained on the unscaled data."));
// 5 EDA
body.push(H1("5. Exploratory Data Analysis"));
body.push(H2("5.1 Churn by contract type"));
body.push(P(`Contract length shows the largest gap of any variable. Month-to-month customers (${rt.Contract["Month-to-month"][1].toLocaleString()} customers) churn at ${rt.Contract["Month-to-month"][0]}%, while one-year contracts churn at ${rt.Contract["One year"][0]}% and two-year contracts at ${rt.Contract["Two year"][0]}%. Customers on flexible contracts can leave at any time without penalty, and they are also the group that has not yet built a long relationship with the company.`));
body.push(...IMG("02_churn_by_contract.png",430,"Figure 2: Churn rate by contract type"));
body.push(H2("5.2 Churn by tenure"));
body.push(P(`Churn falls sharply as tenure increases. Customers in their first year churn at ${R.tenure_band["0-12"]}%, those in months 13-24 at ${R.tenure_band["13-24"]}%, months 25-48 at ${R.tenure_band["25-48"]}% and those beyond four years at ${R.tenure_band["49-72"]}%. The correlation between tenure and churn is ${R.corr_tenure}, a moderate negative relationship. The first year is the critical window for retention.`));
body.push(...IMG("05_churn_by_tenure.png",430,"Figure 3: Churn rate by tenure band"));
body.push(...IMG("08_tenure_charges.png",560,"Figure 4: Tenure distribution and monthly charges by churn status"));
body.push(P(`The tenure histogram shows a large spike of churned customers in the first few months. The box plot shows that churned customers tend to have higher monthly charges (average ${R.avg_monthly_churn} versus ${R.avg_monthly_stay}).`));
body.push(H2("5.3 Churn by internet service"));
body.push(P(`Fibre optic is the premium internet product, yet it has the highest churn at ${rt.InternetService["Fiber optic"][0]}%. DSL customers churn at ${rt.InternetService.DSL[0]}%, and customers without internet service churn at ${rt.InternetService.No[0]}%. This pattern suggests that fibre customers may be unhappy with price, reliability or support, or may be attracted by competitor fibre offers. It is worth investigating further because fibre customers also pay the most.`));
body.push(...IMG("03_churn_by_internet.png",430,"Figure 5: Churn rate by internet service type"));
body.push(H2("5.4 Churn by payment method"));
body.push(P(`Electronic-check customers churn at ${rt.PaymentMethod["Electronic check"][0]}%, compared with ${rt.PaymentMethod["Mailed check"][0]}% for mailed check, ${rt.PaymentMethod["Bank transfer (automatic)"][0]}% for automatic bank transfer and ${rt.PaymentMethod["Credit card (automatic)"][0]}% for automatic credit card. Automatic payment is likely a sign of commitment and convenience, while manual electronic payment makes it easy to reconsider the subscription every month.`));
body.push(...IMG("04_churn_by_payment.png",430,"Figure 6: Churn rate by payment method"));
body.push(H2("5.5 Churn by support and security services"));
body.push(P(`Customers who have Tech Support churn at ${rt.TechSupport.Yes[0]}%, while those without it churn at ${rt.TechSupport.No[0]}%. Online Security shows the same effect (${rt.OnlineSecurity.Yes[0]}% with versus ${rt.OnlineSecurity.No[0]}% without). Online Backup and Device Protection follow the same direction with smaller gaps. These add-on services may make the customer's experience more reliable, and they also tie the customer more closely to the provider.`));
body.push(...IMG("06_churn_by_techsupport.png",400,"Figure 7: Churn rate by tech support"));
body.push(...IMG("07_churn_by_onlinesecurity.png",400,"Figure 8: Churn rate by online security"));
body.push(H2("5.6 Churn by demographics"));
body.push(TBL(["Variable","Group","Churn rate (%)","Customers"],[
["Gender","Female",rt.gender.Female[0],rt.gender.Female[1]],["Gender","Male",rt.gender.Male[0],rt.gender.Male[1]],
["Senior citizen","No",rt.SeniorCitizen["0"][0],rt.SeniorCitizen["0"][1]],["Senior citizen","Yes",rt.SeniorCitizen["1"][0],rt.SeniorCitizen["1"][1]],
["Partner","No",rt.Partner.No[0],rt.Partner.No[1]],["Partner","Yes",rt.Partner.Yes[0],rt.Partner.Yes[1]],
["Dependents","No",rt.Dependents.No[0],rt.Dependents.No[1]],["Dependents","Yes",rt.Dependents.Yes[0],rt.Dependents.Yes[1]]],[2400,2200,2300,2126]));
body.push(sp());
body.push(P(`Gender makes almost no difference (${rt.gender.Female[0]}% versus ${rt.gender.Male[0]}%). Senior citizens churn much more (${rt.SeniorCitizen["1"][0]}% versus ${rt.SeniorCitizen["0"][0]}%), and customers living alone (no partner and no dependents) churn more than those with a family. Family customers may value stability and bundled services more.`));
body.push(H2("5.7 Churn by monthly charges and billing"));
body.push(P(`Churn is lowest for customers paying under 35 per month (${R.charge_band["<35"]}%) and highest for the 70-90 band (${R.charge_band["70-90"]}%). Paperless billing customers churn at ${rt.PaperlessBilling.Yes[0]}% versus ${rt.PaperlessBilling.No[0]}% for those who do not use it. Streaming add-ons show only a small difference (about ${rt.StreamingTV.Yes[0]}% with StreamingTV versus ${rt.StreamingTV.No[0]}% without), and phone service on its own has little impact.`));
body.push(TBL(["Monthly charge band","Churn rate (%)"],Object.entries(R.charge_band).map(([k,v])=>[k,v]),[4513,4513]));
body.push(sp());
body.push(H2("5.8 Correlation of numeric variables"));
body.push(P(`Among the numeric variables, tenure has the strongest negative relationship with churn (${R.corr_tenure}), and MonthlyCharges has a weak positive relationship (${R.corr_monthly}). TotalCharges is strongly correlated with tenure because it is roughly tenure multiplied by monthly charges, so the two carry overlapping information.`));
body.push(...IMG("14_correlation.png",330,"Figure 9: Correlation matrix of numeric variables and churn"));
body.push(H2("5.9 Summary of EDA"));
body.push(P("The exploratory analysis points to a typical churner: a recent customer on a month-to-month contract, using fibre optic internet, paying by electronic check, with no security or tech support add-ons and a relatively high monthly bill. The typical loyal customer has a long contract, is on automatic payment, and has support and security services."));
// 6 Modelling
body.push(H1("6. Predictive Modelling"));
body.push(H2("6.1 Approach"));
body.push(P("Four classification models were trained on the same training set and evaluated on the same held-out test set of 1,409 customers. Class weights were set to 'balanced' for logistic regression, decision tree and random forest, so that the minority class (churn) receives more importance during training. Five-fold stratified cross-validation on the training set was used to check that results are stable."));
body.push(TBL(["Model","Why it was chosen"],[
["Logistic Regression","Simple, fast and interpretable baseline. Coefficients show the direction and strength of each factor."],
["Decision Tree (depth 5)","Easy to explain as a set of rules; limited depth reduces overfitting."],
["Random Forest (300 trees, depth 8)","Combines many trees, handles non-linear relationships and interactions, gives feature importance."],
["Gradient Boosting","Sequentially improves on earlier errors; often strong on tabular data."]],[2800,6226]));
body.push(sp());
body.push(H2("6.2 Evaluation metrics"));
body.push(B("Accuracy: share of all customers classified correctly."));
body.push(B("Precision: of the customers predicted to churn, how many actually churned."));
body.push(B("Recall: of the customers who actually churned, how many the model found."));
body.push(B("F1-score: harmonic mean of precision and recall."));
body.push(B("ROC-AUC: how well the model ranks churners above non-churners across all thresholds (0.5 is random, 1.0 is perfect)."));
body.push(H2("6.3 Model comparison"));
body.push(TBL(["Model","Accuracy","Precision","Recall","F1","ROC-AUC","CV AUC"],Object.entries(m).map(([k,v])=>[k,v.accuracy,v.precision,v.recall,v.f1,v.roc_auc,v.cv_auc]),[2400,1100,1100,1000,1000,1226,1200]));
body.push(sp());
body.push(P(`The four models reach very similar ROC-AUC values (about 0.83 to 0.84), which suggests that the information in the data, and not the algorithm, is the main limit on accuracy. Random Forest has the highest test ROC-AUC (${m["Random Forest"].roc_auc}) and the best F1 (${m["Random Forest"].f1}). Gradient Boosting has the highest accuracy (${m["Gradient Boosting"].accuracy}) and precision, but its recall is only ${m["Gradient Boosting"].recall}, so it misses nearly half of the churners at the default threshold. For a retention use case, finding churners matters more, so Random Forest was selected as the final model. Logistic Regression is a close second and is a good choice when explainability is the priority.`));
body.push(...IMG("09_roc_curves.png",400,"Figure 10: ROC curves for the four models"));
body.push(H2("6.4 Confusion matrix of the selected model"));
body.push(TBL(["","Predicted: Stay","Predicted: Churn"],[["Actual: Stay",tn,fp],["Actual: Churn",fn,tp]],[3026,3000,3000]));
body.push(sp());
body.push(P(`Out of ${tp+fn} customers who actually churned in the test set, the model correctly identified ${tp} (recall ${(tp/(tp+fn)*100).toFixed(1)}%) and missed ${fn}. It also flagged ${fp} loyal customers as at risk (false positives). Precision is therefore ${(tp/(tp+fp)*100).toFixed(1)}%: about one in two flagged customers is a real churner. In a retention setting, a false positive means a customer receives an offer they did not strictly need, which is much cheaper than losing a customer who was never contacted.`));
body.push(...IMG("10_confusion_matrix.png",300,"Figure 11: Confusion matrix of the Random Forest model"));
// 7 Drivers
body.push(H1("7. What Drives Churn?"));
body.push(H2("7.1 Random Forest feature importance"));
body.push(P(`The most important features in the Random Forest are tenure (${R.rf_imp.tenure}), two-year contract (${R.rf_imp["Contract_Two year"]}), TotalCharges (${R.rf_imp.TotalCharges}), fibre optic internet (${R.rf_imp["InternetService_Fiber optic"]}), MonthlyCharges (${R.rf_imp.MonthlyCharges}) and electronic check payment (${R.rf_imp["PaymentMethod_Electronic check"]}). This agrees with the exploratory analysis: how long the customer has stayed, the contract commitment, the type of internet product and the billing method matter most.`));
body.push(...IMG("11_feature_importance.png",430,"Figure 12: Top 12 features by Random Forest importance"));
body.push(H2("7.2 Logistic regression coefficients"));
body.push(P("Logistic regression shows the direction of each effect. Features with negative coefficients reduce the chance of churn and features with positive coefficients increase it, holding the other variables constant. Two-year contract (-1.41), tenure (-1.16) and one-year contract (-0.72) are the strongest protective factors. Fibre optic internet (+1.22) is the strongest risk factor, followed by streaming movies, electronic check and streaming TV. Online Security and Tech Support are both protective."));
body.push(...IMG("12_lr_coefficients.png",430,"Figure 13: Logistic regression coefficients (standardised numeric features)"));
body.push(P("Note on MonthlyCharges and TotalCharges: these two are correlated with each other and with tenure and the service columns, so their individual coefficients should be read with care. For example, MonthlyCharges shows a negative coefficient even though the raw correlation is positive, because the service columns already capture most of the price effect. This is a normal effect of multicollinearity and does not mean that higher bills reduce churn."));
// 8 Threshold
body.push(H1("8. Threshold Tuning and Business Impact"));
body.push(H2("8.1 Choosing a threshold"));
body.push(P("The default threshold of 0.5 is not always the best choice. A lower threshold flags more customers, which raises recall and lowers precision. The right balance depends on the cost of a retention offer compared with the value of a retained customer."));
body.push(TBL(["Threshold","Precision","Recall","F1"],R.threshold.filter((_,i)=>i%2===0).map(r=>r),[2256,2256,2257,2257]));
body.push(sp());
body.push(P("At a threshold of 0.30 the model finds about 90% of churners with a precision of about 43%. At 0.50 it finds about 78% with precision of about 53%. A retention team with low-cost offers (for example a free add-on service) can use a lower threshold such as 0.35 to 0.40, while a team with expensive offers (large discounts) should use 0.5 or higher."));
body.push(...IMG("13_threshold.png",400,"Figure 14: Precision, recall and F1 across thresholds"));
body.push(H2("8.2 Targeting the highest-risk customers"));
body.push(P(`If the customers in the test set are ranked by predicted churn probability and the retention team contacts only the top 20%, they reach ${R.top20_capture}% of all customers who will churn. This is about 2.5 times better than contacting a random 20%. The top-risk group in the test set represents roughly ${R.top20_monthly.toLocaleString()} in monthly billing.`));
body.push(H2("8.3 Revenue at risk"));
body.push(P(`Across the full dataset, churned customers account for ${R.monthly_rev_lost.toLocaleString()} of ${R.monthly_rev_total.toLocaleString()} in monthly charges (${(R.monthly_rev_lost/R.monthly_rev_total*100).toFixed(1)}%). If retention actions saved even 10% of the customers who would otherwise churn, the company would keep roughly ${Math.round(R.monthly_rev_lost*0.1).toLocaleString()} in monthly revenue (before the cost of the offers). This is an illustrative estimate only, since the dataset has no cost or margin information.`));
// 9 Recs
body.push(H1("9. Recommendations"));
const recs=[["Move customers off month-to-month contracts","Offer a discount, free add-on or price lock for customers who move to a one-year or two-year contract. Contract type is the biggest single lever, with churn falling from "+rt.Contract["Month-to-month"][0]+"% to "+rt.Contract["One year"][0]+"% and "+rt.Contract["Two year"][0]+"%."],
["Build a first-year onboarding programme","Almost half of first-year customers leave. A welcome call, a check-in after 30 and 90 days, and an early service-quality review can reduce early churn."],
["Bundle security and tech support with fibre plans","Customers with these services churn at about 15% versus 42% without. Offering a free trial or a bundled price for fibre customers addresses the highest-churn product."],
["Investigate fibre optic service quality and pricing","Fibre churn of "+rt.InternetService["Fiber optic"][0]+"% is more than double DSL. Compare pricing with competitors, check outage and complaint data, and survey fibre customers."],
["Encourage automatic payment","Offer a small credit for switching from electronic check to automatic bank or card payment. These customers churn at about a third of the rate."],
["Run a monthly churn-risk scoring process","Score all customers each month with the Random Forest model and give the retention team the top 20% highest-risk list, with the main reason for each customer (contract, tenure, internet type)."],
["Treat senior and single-person households carefully","These groups churn more. Simple plans, assisted support and household bundles may help."]];
recs.forEach((r,i)=>{body.push(P(`${i+1}. ${r[0]}`,{bold:true,align:AlignmentType.LEFT}));body.push(P(r[1]))});
// 10
body.push(H1("10. Limitations and Future Work"));
body.push(H2("10.1 Limitations"));
["The data is a single snapshot, so the analysis shows association and not proven cause. For example, tech support customers may be more engaged to start with.","There is no data on customer complaints, network quality, call-centre contacts, competitor offers or discounts, which usually explain a lot of churn.","The dataset has no cost or margin information, so the revenue impact estimate is illustrative.","Precision around 53% means roughly half of the flagged customers would not have churned; offers should therefore be low-cost or well targeted.","The models were not extensively tuned; the similar performance of all four suggests that gains would come mainly from richer data."].forEach(t=>body.push(B(t)));
body.push(H2("10.2 Future work"));
["Tune hyperparameters with grid or randomised search and test XGBoost or LightGBM.","Use SHAP values to explain each individual prediction to the retention team.","Add behavioural features such as usage trends, complaints and recent plan changes.","Estimate customer lifetime value and rank customers by expected value at risk and not just by churn probability.","Build a Power BI or Tableau dashboard showing churn KPIs, segments and the monthly risk list.","Run an A/B test of retention offers to measure how many predicted churners can actually be saved."].forEach(t=>body.push(B(t)));
// 11
body.push(H1("11. Conclusion"));
body.push(P(`This project analysed ${R.rows.toLocaleString()} telecom customers with a churn rate of ${R.churn_rate}%. The analysis shows that churn is concentrated among new customers on month-to-month contracts who use fibre optic internet, pay by electronic check and have no security or support add-ons. Demographic factors such as gender have almost no effect, while seniors and single-person households churn somewhat more.`));
body.push(P(`A Random Forest model reached a ROC-AUC of ${m["Random Forest"].roc_auc} and a recall of ${m["Random Forest"].recall} on unseen data, and targeting the top 20% of scored customers captures ${R.top20_capture}% of churners. Combined with the recommendations in this report (longer contracts, early-life onboarding, bundled support and security, automatic payment, and monthly risk scoring), the company has a clear and data-backed plan to reduce churn and protect revenue.`));
body.push(H1("Appendix A: Project Files and Reproduction"));
body.push(TBL(["File","Purpose"],[["data/Telco-Customer-Churn.csv","Source dataset"],["notebook/Customer_Churn_Analysis.ipynb","Complete analysis: cleaning, EDA, modelling, evaluation"],["images/","All charts used in this report"],["report/Customer_Churn_Report.docx","This report"],["requirements.txt","Python libraries needed"],["README.md","Project overview and how to run"]],[4200,4826]));
body.push(sp());
body.push(P("To reproduce: install the libraries in requirements.txt, open the notebook in Jupyter and run all cells from top to bottom. A random seed of 42 is used throughout so results are repeatable."));
body.push(H2("Appendix B: Tools and Libraries"));
["Python 3 for all analysis","Pandas and NumPy for data handling","Matplotlib and Seaborn for visualisation","Scikit-learn for modelling, scaling, cross-validation and metrics"].forEach(t=>body.push(B(t)));
const doc=new Document({
 styles:{default:{document:{run:{font:"Calibri",size:22}}},paragraphStyles:[
 {id:"Heading1",name:"Heading 1",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:34,bold:true,font:"Calibri",color:"1F3A5F"},paragraph:{spacing:{before:240,after:200},outlineLevel:0}},
 {id:"Heading2",name:"Heading 2",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:26,bold:true,font:"Calibri",color:"2E5E8C"},paragraph:{spacing:{before:240,after:120},outlineLevel:1}}]},
 numbering:{config:[{reference:"b",levels:[{level:0,format:LevelFormat.BULLET,text:"•",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:720,hanging:360}}}}]}]},
 sections:[{properties:{page:{margin:{top:1440,bottom:1440,left:1440,right:1440}}},
  footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"Customer Churn Analysis  |  Page ",size:18,color:"777777"}),new TextRun({children:[PageNumber.CURRENT],size:18,color:"777777"})]})]})},
  children:body}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync('report/Customer_Churn_Report.docx',b);console.log('done')});
