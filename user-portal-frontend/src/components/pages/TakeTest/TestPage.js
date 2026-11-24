import { Button, withStyles, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from "@material-ui/core";
import React from "react";
import { connect } from "react-redux";
import { Navigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Avatar, Box } from "@material-ui/core";
import Timer from "../../molecues/TestView/Timer";
import QuestionList from "../../molecues/TestView/QuestionList";
import TestQuestion from "../../molecues/TestView/TestQuestion";
import AlertBox from '../../atoms/Alertbox/AlertBox';
import { endTestAction, saveAnswerAction, selectedOptionAction } from "../../../redux/actions/takeTestAction";
import { setAlert } from "../../../redux/actions/alertAction";

const useStyles = (theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  topBar: {
    backgroundColor: '#3b5998', 
    minHeight: '40px !important',
    padding: '0 15px',
  },
  subBar: {
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #ccc',
    padding: '0 15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: '40px',
  },
  mainArea: {
    display: 'flex',
    flexGrow: 1,
    overflow: 'hidden',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      overflow: 'auto',
    }
  },
  leftPanel: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #ccc',
    [theme.breakpoints.down('sm')]: {
      borderRight: 'none',
      borderBottom: '1px solid #ccc',
      minHeight: '60vh',
    }
  },
  rightPanel: {
    width: '400px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f5f5f5',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    }
  },
  tabsStrip: {
    display: 'flex',
    borderBottom: '1px solid #ccc',
    padding: '5px 15px 0 15px',
  },
  activeTab: {
    backgroundColor: '#4a90e2',
    color: '#fff',
    padding: '8px 15px',
    borderTopLeftRadius: '5px',
    borderTopRightRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  inactiveTab: {
    backgroundColor: '#eee',
    color: '#333',
    padding: '8px 15px',
    borderTopLeftRadius: '5px',
    borderTopRightRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    marginLeft: '5px',
  },
  questionContent: {
    flexGrow: 1,
    overflowY: 'auto',
    padding: '20px',
  },
  bottomActions: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 20px',
    borderTop: '1px solid #ccc',
    backgroundColor: '#f9f9f9',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      gap: '10px',
      padding: '10px',
    }
  },
  submitBtn: {
    backgroundColor: '#4a90e2',
    color: '#fff',
    width: '100%',
    borderRadius: 0,
    padding: '15px 0',
    fontSize: '18px',
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: '#357abd',
    },
    [theme.breakpoints.down('sm')]: {
      padding: '10px 0',
      fontSize: '16px',
    }
  },
  actionButton: {
    textTransform: 'none',
    fontWeight: 'bold',
    borderColor: '#ccc',
    fontSize: '18px',
    padding: '10px 20px',
    flexGrow: 1,
    [theme.breakpoints.down('sm')]: {
      fontSize: '14px',
      padding: '6px 10px',
    }
  },
  actionButtonPrimary: {
    textTransform: 'none',
    fontWeight: 'bold',
    fontSize: '18px',
    padding: '10px 20px',
    flexGrow: 1,
    [theme.breakpoints.down('sm')]: {
      fontSize: '14px',
      padding: '6px 10px',
    }
  },
  userInfoBox: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #ccc',
    [theme.breakpoints.down('sm')]: {
      padding: '8px',
    }
  },
  userAvatar: {
    width: 80,
    height: 80,
    marginRight: 15,
    [theme.breakpoints.down('sm')]: {
      width: 40,
      height: 40,
      marginRight: 10,
    }
  }
});

class TestPage extends React.Component {
  constructor(props) {
    super(props);
    let initialStatuses = [];
    if (this.props.taketest && this.props.taketest.answersheet && this.props.taketest.answersheet.answers) {
      initialStatuses = this.props.taketest.answersheet.answers.map(ans => ans !== null ? 2 : 0);
      if (initialStatuses.length > 0 && initialStatuses[0] === 0) {
        initialStatuses[0] = 1; // Mark first as Not Answered (visited)
      }
    }

    this.state = {
      curIndex: 0,
      questionStatuses: initialStatuses,
      confirmSubmitOpen: false,
    };

    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleCopy = this.handleCopy.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.setCurIndex = this.setCurIndex.bind(this);
    this.handleSaveNext = this.handleSaveNext.bind(this);
    this.handleMarkForReview = this.handleMarkForReview.bind(this);
    this.handleClearResponse = this.handleClearResponse.bind(this);
  }

  handleContextMenu = (e) => { e.preventDefault(); }

  handleKeyDown = (e) => {
    if (e.key === 'PrintScreen') {
      e.preventDefault(); 
      this.props.setAlert({
        isAlert: true,
        type: "error",
        title: "Copying or taking screenshots is disabled during the test."
      });
    }
  }

  handleCopy = (e) => {
    if (window.location.pathname === '/takeTestPage') {
      e.preventDefault();
      this.props.setAlert({
        isAlert: true,
        type: "error",
        title: "Copying or taking screenshots is disabled during the test."
      });
    }
  }

  handleVisibilityChange = () => {
    if (document.hidden) {
      this.props.setAlert({
        isAlert: true,
        type: "warning",
        title: "Warning: You have switched tabs or minimized the window during the test!"
      });
    }
  }

  componentDidMount() {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => console.log("Fullscreen request failed:", err));
      }
    } catch (e) {
      console.log(e);
    }
    document.addEventListener("contextmenu", this.handleContextMenu);
    document.addEventListener("copy", this.handleCopy);
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  componentWillUnmount() {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.log("Exit fullscreen failed:", err));
      }
    } catch (e) {
      console.log(e);
    }
    document.removeEventListener("contextmenu", this.handleContextMenu);
    document.removeEventListener("copy", this.handleCopy);
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
  }

  updateCurrentStatusAndGoNext(newStatus) {
    const { curIndex, questionStatuses } = this.state;
    const newStatuses = [...questionStatuses];
    newStatuses[curIndex] = newStatus;
    
    let nextIndex = curIndex + 1;
    if (nextIndex >= this.props.taketest.answersheet.answers.length) {
      nextIndex = 0; // Wrap around
    }
    
    if (newStatuses[nextIndex] === 0) {
      newStatuses[nextIndex] = 1; // Mark next as visited (Not Answered)
    }

    this.setState({
      questionStatuses: newStatuses,
      curIndex: nextIndex
    }, () => {
      this.props.saveAnswerAction(); // Save answer to backend
    });
  }

  handleSaveNext() {
    const isAnswered = this.props.taketest.answersheet.answers[this.state.curIndex] !== null;
    this.updateCurrentStatusAndGoNext(isAnswered ? 2 : 1);
  }

  handleSaveAndMarkForReview = () => {
    const isAnswered = this.props.taketest.answersheet.answers[this.state.curIndex] !== null;
    if(!isAnswered) {
      this.props.setAlert({
        isAlert: true,
        type: "warning",
        title: "Please select an answer first to Save & Mark for Review. Otherwise use 'Mark for Review & Next'."
      });
      return;
    }
    this.updateCurrentStatusAndGoNext(4);
  }

  handleMarkForReview() {
    // If they click Mark for review & next, we don't save their option if it's supposed to be purely marked for review.
    // Or we save it as 3 (Marked for review without answering).
    // Actually, in JEE, Mark for Review & Next clears the response if you don't explicitly save it, but let's just mark it as 3.
    this.updateCurrentStatusAndGoNext(3);
  }

  handleClearResponse() {
    this.props.selectedOptionAction({ index: this.state.curIndex, ans: null });
    const newStatuses = [...this.state.questionStatuses];
    newStatuses[this.state.curIndex] = 1;
    this.setState({ questionStatuses: newStatuses });
  }

  setCurIndex(x) {
    const newStatuses = [...this.state.questionStatuses];
    if (newStatuses[x] === 0) {
      newStatuses[x] = 1; // Mark as visited
    }
    this.setState({
      curIndex: x,
      questionStatuses: newStatuses
    });
  }

  endtest() {
    this.setState({ confirmSubmitOpen: false });
    this.props.endTestAction();
  }

  jumpToSubjectSection = (startIndex) => {
    this.setCurIndex(startIndex);
  }

  render() {
    const { classes, taketest, user } = this.props;
    if (taketest.isRetrived === false) {
      return (<Navigate to='/' />);
    }
    
    const parsedStartTime = Date.parse(taketest.answersheet.startTime);
    let elapsed = !isNaN(parsedStartTime) ? (Date.now() - parsedStartTime) : 0;
    if (elapsed < 0 || elapsed > taketest.test.duration * 1000) {
      elapsed = 0; // Guard against client clock skew
    }
    var timerTime = Math.max(0, taketest.test.duration * 1000 - elapsed);

    const testTitle = (taketest.test && taketest.test.title) || '';
    const targetClassName = (taketest.test && (taketest.test.targetClassName || (taketest.test.targetClass && taketest.test.targetClass.name))) || '';
    const isJee = testTitle.toLowerCase().includes('jee') || targetClassName.toLowerCase().includes('jee') || (taketest.answersheet && taketest.answersheet.answers && taketest.answersheet.answers.length === 75);
    const isNeet = testTitle.toLowerCase().includes('neet') || targetClassName.toLowerCase().includes('neet') || (taketest.answersheet && taketest.answersheet.answers && taketest.answersheet.answers.length === 180);

    let activeSubjectName = testTitle;
    if (isJee) {
      activeSubjectName = this.state.curIndex < 25 ? 'Physics' : this.state.curIndex < 50 ? 'Chemistry' : 'Mathematics';
    } else if (isNeet) {
      activeSubjectName = this.state.curIndex < 45 ? 'Physics' : this.state.curIndex < 90 ? 'Chemistry' : 'Biology';
    }

    return (
      <div className={classes.root} style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}>
        {/* TOP BAR */}
        <Box display="flex" justifyContent="flex-end" alignItems="center" className={classes.topBar} color="white">
          <Box display="flex" gap="10px">
            <Button style={{color: 'white', textTransform: 'none'}} size="small">Question Paper</Button>
            <Button style={{color: 'white', textTransform: 'none'}} size="small">Instructions</Button>
          </Box>
        </Box>

        {/* SUB BAR - Fixed Subject Sections */}
        <div className={classes.subBar}>
          <div style={{display: 'flex', gap: '5px', alignItems: 'center'}}>
            {isJee ? (
              <React.Fragment>
                <div 
                  className={this.state.curIndex < 25 ? classes.activeTab : classes.inactiveTab}
                  onClick={() => this.jumpToSubjectSection(0)}
                  style={{cursor: 'pointer'}}
                >
                  Physics (1-25)
                </div>
                <div 
                  className={this.state.curIndex >= 25 && this.state.curIndex < 50 ? classes.activeTab : classes.inactiveTab}
                  onClick={() => this.jumpToSubjectSection(25)}
                  style={{cursor: 'pointer'}}
                >
                  Chemistry (26-50)
                </div>
                <div 
                  className={this.state.curIndex >= 50 ? classes.activeTab : classes.inactiveTab}
                  onClick={() => this.jumpToSubjectSection(50)}
                  style={{cursor: 'pointer'}}
                >
                  Mathematics (51-75)
                </div>
              </React.Fragment>
            ) : isNeet ? (
              <React.Fragment>
                <div 
                  className={this.state.curIndex < 45 ? classes.activeTab : classes.inactiveTab}
                  onClick={() => this.jumpToSubjectSection(0)}
                  style={{cursor: 'pointer'}}
                >
                  Physics (1-45)
                </div>
                <div 
                  className={this.state.curIndex >= 45 && this.state.curIndex < 90 ? classes.activeTab : classes.inactiveTab}
                  onClick={() => this.jumpToSubjectSection(45)}
                  style={{cursor: 'pointer'}}
                >
                  Chemistry (46-90)
                </div>
                <div 
                  className={this.state.curIndex >= 90 ? classes.activeTab : classes.inactiveTab}
                  onClick={() => this.jumpToSubjectSection(90)}
                  style={{cursor: 'pointer'}}
                >
                  Biology (91-180)
                </div>
              </React.Fragment>
            ) : (
              <div className={classes.activeTab} style={{borderTopLeftRadius: '0px', borderTopRightRadius: '0px'}}>
                {testTitle}
              </div>
            )}
          </div>
          <div style={{display: 'flex', alignItems: 'center', fontWeight: 'bold'}}>
            Time Left: &nbsp; <Timer time={timerTime} />
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className={classes.mainArea} style={{ userSelect: 'none' }}>
          {/* LEFT PANEL */}
          <div className={classes.leftPanel}>
            
            <div className={classes.questionContent}>
              <AlertBox />
              <TestQuestion 
                question={this.state.curIndex} 
                answer={taketest.answersheet.answers[this.state.curIndex]}
              />
            </div>

            <div className={classes.bottomActions}>
              <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                <Button variant="outlined" onClick={this.handleMarkForReview} className={classes.actionButton}>Mark for Review & Next</Button>
                <Button variant="outlined" onClick={this.handleClearResponse} className={classes.actionButton}>Clear Response</Button>
              </div>
              <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                <Button variant="contained" style={{backgroundColor: '#7b1fa2', color: 'white'}} onClick={this.handleSaveAndMarkForReview} className={classes.actionButtonPrimary}>Save & Mark for Review</Button>
                <Button variant="contained" style={{backgroundColor: '#4caf50', color: 'white'}} onClick={this.handleSaveNext} className={classes.actionButtonPrimary}>Save & Next</Button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className={classes.rightPanel}>
            <Box className={classes.userInfoBox}>
              <Avatar className={classes.userAvatar} />
              <Typography variant="h6" style={{fontWeight: 'bold', color: '#333'}}>
                {user.username}
              </Typography>
            </Box>
            
            <QuestionList 
              answers={taketest.answersheet.answers} 
              questionStatuses={this.state.questionStatuses}
              callback={this.setCurIndex} 
              curIndex={this.state.curIndex}
              subject={activeSubjectName}
            />

            <Button className={classes.submitBtn} onClick={() => this.setState({ confirmSubmitOpen: true })}>
              Submit Test
            </Button>
          </div>
        </div>

        {/* Confirmation Dialog before Submitting Test */}
        <Dialog
          open={this.state.confirmSubmitOpen}
          onClose={() => this.setState({ confirmSubmitOpen: false })}
          aria-labelledby="confirm-submit-dialog-title"
        >
          <DialogTitle id="confirm-submit-dialog-title">Submit Exam Confirmation</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to submit your exam? Once submitted, you cannot change any answers.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ confirmSubmitOpen: false })} color="primary">
              Cancel & Continue Exam
            </Button>
            <Button onClick={() => this.endtest()} variant="contained" color="secondary" autoFocus>
              Yes, Submit Exam
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

const mapStatetoProps = state => ({
  user: state.user,
  taketest: state.takeTestDetails
})
export default withStyles(useStyles)(connect(mapStatetoProps, {
  endTestAction,
  saveAnswerAction,
  selectedOptionAction,
  setAlert
})(TestPage));