class NutritionFactsClass {
  // use `any` to avoid defining [Symbol.iterator]() manually
  nfs: any = {
    nf_cal: 0,
    nf_calcium: 0,
    nf_chol: 0,
    nf_cholp: 0,
    nf_diefib: 0,
    nf_diefibp: 0,
    nf_fatcal: 0,
    nf_iron: 0,
    nf_protein: 0,
    nf_sf: 0,
    nf_sfp: 0,
    nf_size: 0,
    nf_sodium: 0,
    nf_sodiump: 0,
    nf_sugars: 0,
    nf_tf: 0,
    nf_totalcar: 0,
    nf_totalcarp: 0,
    nf_totalf: 0,
    nf_totalfp: 0,
    nf_unit: '',
    nf_vitaa: 0,
    nf_vitac: 0,
  };

  constructor(nfs: any) {
    this.nfs = nfs;
  }

  multiFacToStringObj(fac: number): any {
    let strObj: any = {};
    for (const [key, val] of Object.entries(this.nfs)) {
      if (typeof val !== 'number') {
        strObj[key] = val;
        continue;
      }
      strObj[key] = (val as number * fac).toFixed(1);
    }
    return strObj;
  }

  toStringObj(): any {
    let strObj: any = {};
    for (const [key, val] of Object.entries(this.nfs)) {
      if (typeof val !== 'number') {
        strObj[key] = val;
        continue;
      }
      if (isNaN(val)) {
        strObj[key] = '--';
      } else {
        strObj[key] = val.toFixed(1);
      }
    }
    return strObj;
  }
}

export default NutritionFactsClass;
