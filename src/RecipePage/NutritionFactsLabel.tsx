import React from 'react';
import {
  useState, useEffect, useContext, useCallback
} from 'react';

import {
  Input
} from '@material-ui/core';

import '../styles/nfl.css';
import NutritionFactsClass from './NutritionFactsClass';

// design from https://www.accessdata.fda.gov/scripts/interactivenutritionfactslabel/
function NutritionFactsLabel(props: any) {

  const nfs: NutritionFactsClass = props.nfs;

  const [nfsStr, setnfsStr] = useState(() => {
    return nfs.toStringObj();
  });
  const [sizeVal, setSizeVal] = useState(1);
  const [sizeStr, setSizeStr] = useState('1');

  const error = isNaN(parseFloat(sizeStr));

  const handleOnChange = useCallback((event: any) => {
    setSizeStr(event.target.value);
    if (!isNaN(parseFloat(event.target.value))) {
      setSizeVal(parseFloat(event.target.value));
    }
  }, [setSizeStr, setSizeVal]);

  useEffect(() => {
    setnfsStr(nfs.multiFacToStringObj(sizeVal));
    console.log(sizeVal);
  }, [sizeVal, setnfsStr, nfs]);

  const {
    nf_cal,
    nf_calcium,
    nf_chol,
    nf_cholp,
    nf_diefib,
    nf_diefibp,
    nf_fatcal,
    nf_iron,
    nf_protein,
    nf_sf,
    nf_sfp,
    nf_size,
    nf_sodium,
    nf_sodiump,
    nf_sugars,
    nf_tf,
    nf_totalcar,
    nf_totalcarp,
    nf_totalf,
    nf_totalfp,
    nf_unit,
    nf_vitaa,
    nf_vitac
  } = nfsStr;

  return (
    <div id="facts" className="nfl-front">
      <div className="facts_title">Nutrition Facts</div>

      <div className="facts_serving_size">

        Serving size

        <div style={{ color: '#808080' }}>
          <Input
            error={error}
            onChange={handleOnChange}
            id="size"
            defaultValue={nf_size}
            style={{ width: 60 }}
          />
            Enter Size
        </div>

        {nf_unit}

      </div>

      <div className="facts_box">
        <div className="fact_row_norule"><small>Amount Per Serving</small></div>
        <div className="fact_row calories"><div className="calorieamt">{nf_cal}</div><strong>Calories</strong></div>
        <div className="fact_row sub"><div>{nf_fatcal}</div>Fat Cal.</div>
      </div>

      <div className="facts_box thin">
        <div className="fact_row txt_right"><strong><small>% Daily Value*</small></strong></div>
        <div className="fact_row"><div><strong>{nf_totalfp}%</strong></div><strong>Total Fat</strong> {nf_totalf}g</div>
        <div className="fact_row sub"><div><strong>{nf_sfp}%</strong></div>Saturated Fat {nf_sf}g</div>
        <div className="fact_row sub"><em>Trans</em> Fat {nf_tf}g</div>
        <div className="fact_row"><div><strong>{nf_cholp}%</strong></div><strong>Cholesterol</strong> {nf_chol}mg</div>
        <div className="fact_row"><div><strong>{nf_sodiump}%</strong></div><strong>Sodium</strong> {nf_sodium}mg</div>
        <div className="fact_row"><div><strong>{nf_totalcarp}%</strong></div><strong>Total Carbohydrate</strong> {nf_totalcar}g</div>
        <div className="fact_row sub"><div><strong>{nf_diefibp}%</strong></div>Dietary Fiber {nf_diefib}g</div>
        <div className="fact_row sublv2">Total Sugars {nf_sugars}g</div>
        <div className="fact_row"><strong>Protein</strong> {nf_protein}g</div>
      </div>

      <div className="facts_box">
        <div className="fact_row"><div>{nf_vitaa}%</div>Vitamin A</div>
        <div className="fact_row"><div>{nf_vitac}%</div>Vitamin C</div>
        <div className="fact_row"><div>{nf_calcium}%</div>Calcium</div>
        <div className="fact_row"><div>{nf_iron}%</div>Iron</div>
      </div>

      <div className="facts_descr">
        The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.
      </div>

    </div>
  );
}

export default NutritionFactsLabel;
