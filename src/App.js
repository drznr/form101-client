import React from 'react';
import bg1 from './images/bg1.jpg';
import bg2 from './images/bg2.jpg';
import './App.scss';
import SignaturePad from 'signature_pad';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

class App extends React.Component {
  state = {};
  cover = React.createRef();
  coverErr = React.createRef();
  idInput = React.createRef();
  lnameInput = React.createRef();
  sigPad = React.createRef();
  sign1 = React.createRef();
  sign2 = React.createRef();
  sign3 = React.createRef();
  coverAns = React.createRef();
  wentGood = React.createRef();
  wentBad = React.createRef();
  didSign = false;
  isMain = false;
  sigBtn = React.createRef();
  signaturePad;

  handleFormData = () => {
    if (this.idInput.current.checkValidity() && this.state.lname && this.state.fname && this.state.dob && this.state.street && this.state.adress && this.state.city && this.state.gender && this.state.status && this.state.residence && this.state.kibutz && this.state.hmo && this.state.otherIncome && this.didSign) {
      if (this.state.otherIncome === "yes" && !this.state.income) {
        this.handleValidation();
        return;
      }
      if (this.state.hmo === "yes" && !this.state.hmoName) {
        this.handleValidation();
        return;
      }
      window.scrollTo(0, 0);
      html2canvas(document.querySelector('.form101')).then(async (canvas) => {
        document.body.appendChild(canvas);
        const dataUrl = canvas.toDataURL('image/jpg');
        const doc = new jsPDF();
        doc.addImage(dataUrl, 'jpg', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
        let obj = {}
        obj.data = doc.output('datauristring');
        const resp = await fetch('/api', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(obj)
        });
        const data = await resp.json();
        this.coverAns.current.classList.add('active');
        if (data && data.accepted.length > 0) {
          this.wentBad.current.classList.add('hide');
        } else {
          this.wentGood.current.classList.add('hide');
        }
      });

    } else {
      this.handleValidation();
    }
  }
  handleModal = (isMust) => {
    this.cover.current.classList.toggle('active');
    this.handleSignature(isMust);
  }
  closeModal = () => {
    this.coverErr.current.classList.remove('active');
  }
  closeAnsModal = () => {
    this.coverAns.current.classList.remove('active');
    this.wentGood.current.classList.remove('hide');
    this.wentBad.current.classList.remove('hide');
  }
  handleValidation = () => {
    let reqFields = document.querySelectorAll('input:required');
    this.idInput.current.classList.add('unValid');
    this.sigBtn.current.classList.add('unValid');
    reqFields.forEach(field => {
      field.classList.add('unValid');
    });
    this.coverErr.current.classList.toggle('active');
  }

  handleChange = (e) => {
    if (!e.target.checkValidity()) {
      e.target.classList.add('unValid');
    } else {
      e.target.classList.remove('unValid');
    }
    this.setState({ [e.target.name]: e.target.value });
  }

  handleSignature = (isMust) => {
    const canvas = this.sigPad.current;
    this.signaturePad = new SignaturePad(canvas);
    if (isMust) this.isMain = true;
    else this.isMain = false;
  }
  clearCanvas = () => {
    this.signaturePad.clear();
  }
  saveSignature = () => {
    const data = this.signaturePad.toDataURL("image/svg+xml");
    if (!this.signaturePad.isEmpty()) {
      this.sigBtn.current.classList.remove('unValid');
      let signature = document.createElement('img');
      signature.setAttribute('src', data);
      signature.setAttribute('className', "sig");
      if (this.isMain) {
        this.sigBtn.current.appendChild(signature);
        this.didSign = true;
      } else {
        if (this.sign1.current.innerHTML === "") this.sign1.current.appendChild(signature);
        else if (this.sign2.current.innerHTML === "") this.sign2.current.appendChild(signature);
        else if (this.sign3.current.innerHTML === "") this.sign3.current.appendChild(signature);
      }
      this.cover.current.classList.remove('active');
    }
  }

  render() {
    return (
      <section>
        <div className="cover ans" ref={this.coverAns}>
          <aside className="modal ans">
            <div className="modal__header ans">
                <span className="x" onClick={this.closeAnsModal}>&#x2716;</span>
            </div>
            <div className="modal__body ans">
                <div className="modal__body__good" ref={this.wentGood}>הטופס נשלח בהצלחה!</div>
                <div className="modal__body__bad" ref={this.wentBad}>ארעה שגיאה בשליחת הטופס <br /> אנא נסה שנית.</div>
                <button className="btn ans" onClick={this.closeAnsModal}>אישור</button>
            </div>
          </aside>
        </div>
        <div className="cover" ref={this.cover}>
          <aside className="modal">
            <div className="modal__header">
              הוספת חתימה <span className="x" onClick={this.handleModal}>&#x2716;</span>
            </div>
            <div className="modal__body">
              <p>על מנת להוסיף את החתימה שלכם נא העלו תמונה של החתימה או ציירו אותה על המשטח שלהלן</p>
              <canvas ref={this.sigPad} id="sig-pad">Update your browser to enjoy canvas.</canvas>
              <div>
                <button className="btn clean" onClick={this.clearCanvas}>ניקוי</button>
                <button className="btn approve" onClick={this.saveSignature}>אישור</button>
              </div>
            </div>
            <div className="modal__footer">
              <button className="modal__footer__btn btn" onClick={this.handleModal}>סגור</button>
            </div>
          </aside>
        </div>
        <div className="cover err" ref={this.coverErr}>
          <aside className="modal err">
            <div className="modal__header err">שימו לב!</div>
            <div className="modal__body err">
              חלק מהנתונים בשדות חסרים או שגויים.
              נא עברו עליהם ותקנו את הדרוש.
              </div>
            <button className="modal__btn err" onClick={this.closeModal}>אישור</button>
          </aside>
        </div>
        <div className="header">
          <button className="btn" onClick={this.handleFormData}>שמור והמשך</button>
        </div>
        <div className="form101">
          <img src={bg1} alt="101 form" className="form101__bg1" />
          <img src={bg2} alt="101 form" className="form101__bg2" />
          <input type="text" name="year" onChange={this.handleChange} value={new Date().getFullYear()} className="form101__year" />
          <span>
            <input type="text" name="id" onChange={this.handleChange} ref={this.idInput} pattern={"^[0-9]{9}$"} className="form101__id" />
            <input type="text" name="lname" onChange={this.handleChange} required ref={this.lnameInput} className="form101__lname" />
            <input type="text" name="fname" onChange={this.handleChange} required className="form101__fname" />
            <input type="date" name="dob" onChange={this.handleChange} required className="form101__dob" />
            <input type="date" name="doa" className="form101__doa" />
            <input type="text" name="street" onChange={this.handleChange} required className="form101__street" />
            <input type="number" min="0" name="adress" onChange={this.handleChange} required className="form101__adress" />
            <input type="text" name="city" onChange={this.handleChange} required className="form101__city" />
            <input type="text" name="zip" className="form101__zip" />
            <input type="text" name="phone" className="form101__phone" />
            <input type="text" name="mobile" className="form101__mobile" />
            <input type="radio" name="gender" onChange={this.handleChange} required value="male" className="form101__male" />
            <input type="radio" name="gender" onChange={this.handleChange} required value="female" className="form101__female" />
            <input type="radio" name="status" onChange={this.handleChange} required value="single" className="form101__single" />
            <input type="radio" name="status" onChange={this.handleChange} required value="married" className="form101__married" />
            <input type="radio" name="status" onChange={this.handleChange} required value="divorced" className="form101__div" />
            <input type="radio" name="status" onChange={this.handleChange} required value="weddow" className="form101__wid" />
            <input type="radio" name="status" onChange={this.handleChange} required value="seperate" className="form101__sep" />
            <input type="radio" name="residence" onChange={this.handleChange} required value="yes" className="form101__resYes" />
            <input type="radio" name="residence" onChange={this.handleChange} required value="no" className="form101__resNo" />
            <input type="radio" name="kibutz" onChange={this.handleChange} required value="yes" className="form101__kibYes" />
            <input type="radio" name="kibutz" onChange={this.handleChange} required value="no" className="form101__kibNo" />
            <input type="radio" name="hmo" onChange={this.handleChange} required value="yes" className="form101__hmoYes" />
            <input type="radio" name="hmo" onChange={this.handleChange} required value="no" className="form101__hmoNo" />
            <input type="text" name="hmoName" onChange={this.handleChange} className="form101__hmo" />
            <input type="date" name="workStart" className="form101__workStart" />
            <input type="radio" name="salary" value="regular" className="form101__regular" />
            <input type="radio" name="salary" value="2jobs" className="form101__2jobs" />
            <input type="radio" name="salary" value="part" className="form101__part" />
            <input type="radio" name="salary" value="day" className="form101__day" />
            <input type="radio" name="salary" value="pension" className="form101__pension" />
            <input type="radio" name="salary" value="stipend" className="form101__stipend" />
            <input type="checkbox" name="child1" value="posession" className="form101__c1Posession" />
            <input type="checkbox" name="child1" value="pension" className="form101__c1Pension" />
            <input type="text" name="c1Name" className="form101__c1Name" />
            <input type="text" name="c1Id" className="form101__c1Id" />
            <input type="date" name="child1Dob" className="form101__c1Dob" />
            <input type="checkbox" name="child2" value="posession" className="form101__c2Posession" />
            <input type="checkbox" name="child2" value="pension" className="form101__c2Pension" />
            <input type="text" name="c2Name" className="form101__c2Name" />
            <input type="text" name="c2Id" className="form101__c2Id" />
            <input type="date" name="child2Dob" className="form101__c2Dob" />
            <input type="checkbox" name="child3" value="posession" className="form101__c3Posession" />
            <input type="checkbox" name="child3" value="pension" className="form101__c3Pension" />
            <input type="text" name="c3Name" className="form101__c3Name" />
            <input type="text" name="c3Id" className="form101__c3Id" />
            <input type="date" name="child3Dob" className="form101__c3Dob" />
            <input type="checkbox" name="child4" value="posession" className="form101__c4Posession" />
            <input type="checkbox" name="child4" value="pension" className="form101__c4Pension" />
            <input type="text" name="c4Name" className="form101__c4Name" />
            <input type="text" name="c4Id" className="form101__c4Id" />
            <input type="date" name="child4Dob" className="form101__c4Dob" />
            <input type="checkbox" name="child5" value="posession" className="form101__c5Posession" />
            <input type="checkbox" name="child5" value="pension" className="form101__c5Pension" />
            <input type="text" name="c5Name" className="form101__c5Name" />
            <input type="text" name="c5Id" className="form101__c5Id" />
            <input type="date" name="child5Dob" className="form101__c5Dob" />
            <input type="checkbox" name="child6" value="posession" className="form101__c6Posession" />
            <input type="checkbox" name="child6" value="pension" className="form101__c6Pension" />
            <input type="text" name="c6Name" className="form101__c6Name" />
            <input type="text" name="c6Id" className="form101__c6Id" />
            <input type="date" name="child6Dob" className="form101__c6Dob" />
            <input type="checkbox" name="child7" value="posession" className="form101__c7Posession" />
            <input type="checkbox" name="child7" value="pension" className="form101__c7Pension" />
            <input type="text" name="c7Name" className="form101__c7Name" />
            <input type="text" name="c7Id" className="form101__c7Id" />
            <input type="date" name="child7Dob" className="form101__c7Dob" />
            <input type="checkbox" name="child8" value="posession" className="form101__c8Posession" />
            <input type="checkbox" name="child8" value="pension" className="form101__c8Pension" />
            <input type="text" name="c8Name" className="form101__c8Name" />
            <input type="text" name="c8Id" className="form101__c8Id" />
            <input type="date" name="child8Dob" className="form101__c8Dob" />
            <input type="checkbox" name="child9" value="posession" className="form101__c9Posession" />
            <input type="checkbox" name="child9" value="pension" className="form101__c9Pension" />
            <input type="text" name="c9Name" className="form101__c9Name" />
            <input type="text" name="c9Id" className="form101__c9Id" />
            <input type="date" name="child9Dob" className="form101__c9Dob" />
            <input type="checkbox" name="child10" value="posession" className="form101__c10Posession" />
            <input type="checkbox" name="child10" value="pension" className="form101__c10Pension" />
            <input type="text" name="c10Name" className="form101__c10Name" />
            <input type="text" name="c10Id" className="form101__c10Id" />
            <input type="date" name="child10Dob" className="form101__c10Dob" />
            <input type="checkbox" name="child11" value="posession" className="form101__c11Posession" />
            <input type="checkbox" name="child11" value="pension" className="form101__c11Pension" />
            <input type="text" name="c11Name" className="form101__c11Name" />
            <input type="text" name="c11Id" className="form101__c11Id" />
            <input type="date" name="child11Dob" className="form101__c11Dob" />
            <input type="checkbox" name="child12" value="posession" className="form101__c12Posession" />
            <input type="checkbox" name="child12" value="pension" className="form101__c12Pension" />
            <input type="text" name="c12Name" className="form101__c12Name" />
            <input type="text" name="c12Id" className="form101__c12Id" />
            <input type="date" name="child12Dob" className="form101__c12Dob" />
            <input type="checkbox" name="child13" value="posession" className="form101__c13Posession" />
            <input type="checkbox" name="child13" value="pension" className="form101__c13Pension" />
            <input type="text" name="c13Name" className="form101__c13Name" />
            <input type="text" name="c13Id" className="form101__c13Id" />
            <input type="date" name="child13Dob" className="form101__c13Dob" />
            <input type="radio" name="otherIncome" value="no" onChange={this.handleChange} required className="form101__OIno" />
            <input type="radio" name="otherIncome" value="yes" onChange={this.handleChange} required className="form101__OIyes" />
            <input type="checkbox" name="income" onChange={this.handleChange} value="month-salary" className="form101__Msalary" />
            <input type="checkbox" name="income" onChange={this.handleChange} value="extra-salary" className="form101__EXsalary" />
            <input type="checkbox" name="income" onChange={this.handleChange} value="part-salary" className="form101__Psalary" />
            <input type="checkbox" name="income" onChange={this.handleChange} value="day-salary" className="form101__Dsalary" />
            <input type="checkbox" name="income" onChange={this.handleChange} value="pension-salary" className="form101__PENsalary" />
            <input type="checkbox" name="income" onChange={this.handleChange} value="stipend-salary" className="form101__Ssalary" />
            <input type="checkbox" name="income" onChange={this.handleChange} value="other-salary" className="form101__Osalary" />
            <input type="text" name="incomeOther" className="form101__incomeOther" />
            <input type="checkbox" name="incomeType" value="option1" className="form101__income1" />
            <input type="checkbox" name="incomeType" value="option2" className="form101__income2" />
            <input type="checkbox" name="incomeType" value="option3" className="form101__income3" />
            <input type="checkbox" name="incomeType" value="option4" className="form101__income4" />
            <input type="text" name="partnerId" className="form101__partnerId" />
            <input type="text" name="partnerLname" className="form101__partnerLname" />
            <input type="text" name="partnerFname" className="form101__partnerFname" />
            <input type="date" name="partnerDob" className="form101__partnerDob" />
            <input type="date" name="partnerDoa" className="form101__partnerDoa" />
            <input type="radio" name="partner-income" value="no" className="form101__PIno" />
            <input type="radio" name="partner-income" value="yes" className="form101__PIyes" />
            <input type="checkbox" name="partner-income-type" value="work" className="form101__PIT1" />
            <input type="checkbox" name="partner-income-type" value="other" className="form101__PIT2" />
            <input type="date" name="changeDate1" className="form101__changeYear1" />
            <input type="text" name="changeDetails1" className="form101__changeDetails1" />
            <input type="date" name="changeMsgDate1" className="form101__changeMsg1" />
            <button className="form101__changeSig1" ref={this.sign1} onClick={this.handleModal.bind(this, false)}></button>
            <input type="date" name="changeDate2" className="form101__changeYear2" />
            <input type="text" name="changeDetails2" className="form101__changeDetails2" />
            <input type="date" name="changeMsgDate2" className="form101__changeMsg2" />
            <button className="form101__changeSig2" ref={this.sign2} onClick={this.handleModal.bind(this, false)}></button>
            <input type="date" name="changeDate3" className="form101__changeYear3" />
            <input type="text" name="changeDetails3" className="form101__changeDetails3" />
            <input type="date" name="changeMsgDate3" className="form101__changeMsg3" />
            <button className="form101__changeSig3" ref={this.sign3} onClick={this.handleModal.bind(this, false)}></button>
            <input type="checkbox" name="exempt-reason" value="1" className="form101__ER1" />
            <input type="checkbox" name="exempt-reason" value="2" className="form101__ER2" />
            <input type="checkbox" name="exempt-reason" value="3" className="form101__ER3" />
            <input type="date" name="ER3date" className="form101__ER3date" />
            <input type="text" name="ER3adress" className="form101__ER3adress" />
            <input type="checkbox" name="exempt-reason" value="4" className="form101__ER4" />
            <input type="checkbox" name="newResident" value="new" className="form101__ER4new" />
            <input type="checkbox" name="newResident" value="return" className="form101__ER4return" />
            <input type="date" name="ER4date" className="form101__ER4date" />
            <input type="date" name="ER4date2" className="form101__ER4date2" />
            <input type="checkbox" name="exempt-reason" value="5" className="form101__ER5" />
            <input type="checkbox" name="exempt-reason" value="6" className="form101__ER6" />
            <input type="checkbox" name="exempt-reason" value="7" className="form101__ER7" />
            <input type="checkbox" name="children" value="born" className="form101__ER7born" />
            <input type="checkbox" name="children" value="under5" className="form101__ER7under5" />
            <input type="number" name="childrensNumBorn" className="form101__ER7bornNum" />
            <input type="number" name="childrensNumUnder5" className="form101__ER7under5Num" />
            <input type="checkbox" name="children" value="under17" className="form101__ER7under17" />
            <input type="checkbox" name="children" value="under18" className="form101__ER7under18" />
            <input type="number" name="childrensNumUnder17" className="form101__ER7under17Num" />
            <input type="number" name="childrensNumUnder18" className="form101__ER7under18Num" />
            <input type="checkbox" name="exempt-reason" value="8" className="form101__ER8" />
            <input type="checkbox" name="infants" value="born" className="form101__ER8born" />
            <input type="checkbox" name="infants" value="under5" className="form101__ER8under5" />
            <input type="number" name="infantsNumBorn" className="form101__ER8bornNum" />
            <input type="number" name="infantsNumUnder5" className="form101__ER8under5Num" />
            <input type="checkbox" name="exempt-reason" value="9" className="form101__ER9" />
            <input type="checkbox" name="exempt-reason" value="10" className="form101__ER10" />
            <input type="checkbox" name="exempt-reason" value="11" className="form101__ER11" />
            <input type="checkbox" name="exempt-reason" value="12" className="form101__ER12" />
            <input type="checkbox" name="exempt-reason" value="13" className="form101__ER13" />
            <input type="checkbox" name="exempt-reason" value="14" className="form101__ER14" />
            <input type="date" name="ER14serviceStart" className="form101__ER14date1" />
            <input type="date" name="ER14serviceEnd" className="form101__ER14date2" />
            <input type="checkbox" name="exempt-reason" value="15" className="form101__ER15" />
            <input type="checkbox" name="tax-coordination" value="noIncome" className="form101__TCno" />
            <input type="checkbox" name="tax-coordination" value="yesIncome" className="form101__TCyes" />
            <input type="text" name="employerName1" className="form101__EN1" />
            <input type="text" name="employerAdress1" className="form101__EA1" />
            <input type="text" name="employerNumber1" className="form101__ENum1" />
            <input type="text" name="employerType1" className="form101__ET1" />
            <input type="text" name="monthlyIncome1" className="form101__MI1" />
            <input type="text" name="taxCleaned1" className="form101__TC1" />
            <input type="text" name="employerName2" className="form101__EN2" />
            <input type="text" name="employerAdress2" className="form101__EA2" />
            <input type="text" name="employerNumber2" className="form101__ENum2" />
            <input type="text" name="employerType2" className="form101__ET2" />
            <input type="text" name="monthlyIncome2" className="form101__MI2" />
            <input type="text" name="taxCleaned2" className="form101__TC2" />
            <input type="text" name="employerName3" className="form101__EN3" />
            <input type="text" name="employerAdress3" className="form101__EA3" />
            <input type="text" name="employerNumber3" className="form101__ENum3" />
            <input type="text" name="employerType3" className="form101__ET3" />
            <input type="text" name="monthlyIncome3" className="form101__MI3" />
            <input type="text" name="taxCleaned3" className="form101__TC3" />
            <input type="checkbox" name="assessor-approved" value="yes" className="form101__AA" />
            <input type="date" name="date" className="form101__date" />
            <button className="form101__signature" onClick={this.handleModal.bind(this, true)} ref={this.sigBtn}></button>
          </span>

        </div>
      </section>
    );
  }
}

export default App;
