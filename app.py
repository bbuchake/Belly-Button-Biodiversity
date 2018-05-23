# import necessary libraries
import numpy as np
import pandas as pd

from flask import (    
    Flask,    
    render_template,    
    jsonify,    
    request,   
    redirect)

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import inspect, create_engine, func, desc
from sqlalchemy.engine import reflection

# Flask Setup
app = Flask(__name__)

#DB Setup
engine = create_engine("sqlite:///db/belly_button_biodiversity.sqlite")

# Reflecting db into a new model
Base = automap_base()

# reflect tables
Base.prepare(engine, reflect=True)

# Save tables to classes
Metadata = Base.classes.samples_metadata
Otu = Base.classes.otu
Samples = Base.classes.samples

#initiate a session
session = Session(engine)

#Creating routes
    
# create route that renders index.html template
@app.route("/")
def home():    
    return render_template("index.html")

#Create a route that renders a list of the sample names
@app.route("/names")
def sample_names():
    #Get sample ID from MetaData
    samples = session.query(Metadata.SAMPLEID)
    #Append to BB_ and return as list
    return ['BB_' + str(name[0]) for name in samples]

#Create a route that returns a list of OTU descriptions
@app.route('/otu')
def otu_desc():
    otu_descs = session.query(Otu.lowest_taxonomic_unit_found)
    return [desc[0] for desc in otu_descs]

#Create a route that returns MetaData for a given sample.
@app.route('/metadata/<sample>')
def metadata_sample(sample): 
    result = session.query(Metadata).filter(Metadata.SAMPLEID == int(sample[3:]))
    return jsonify(result)

#Create a route that returns Weekly Washing Frequency as a number
@app.route('/wfreq/<sample>')
def get_wfreq(sample):
    wfreq = session.query(Metadata.WFREQ).filter(Metadata.SAMPLEID == int(sample[3:]))
    return wfreq

#Create a route that returns OTU IDs and Sample Values for a given sample
@app.route('/samples/<sample>')
def get_values(sample):
    
    result_df = pd.read_sql("SELECT otu_id, (%s) FROM samples" % (sample), session.bind)
    result_df.columns = ['otu_id',sample]
    result_df = result_df.sort_values(by=sample, ascending=False)
    otu_list = result_df['otu_id'].tolist()
    sample_value = result_df[sample].tolist()
    result = {
        'otu_ids': otu_list,
        'sample_values': sample_value
    }
    return result
    

if __name__ == "__main__":    
    app.run()