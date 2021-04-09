/**
  @file
  @brief Update job contents
  @details  Will write back SAS code to a Stored Process or Viya Job

  <h4> Service Inputs </h4>
  <h5> INDATA</h5>
  |folderpath $|jobname $|
  |---|---|
  |/some/folder|someJob|

  <h5>SOURCECODE</h5>
  |codeline $|
  |---|
  |proc sort;|
  |quit;|

  <h4> Service Outputs </h4>
  <h5>RESULT</h5>
  |result $|
  |---|
  |SUCCESS|

  Alternatively, sasjsabort will be returned.


  <h4> SAS Macros </h4>
  @li mf_getplatform.sas
  @li mf_nobs.sas
  @li mp_abort.sas
  @li mv_createjob.sas
  @li mm_updatestpsourcecode.sas

**/

%webout(FETCH)

data _null_;
  set indata;
  call symputx('folderpath',folderpath);
  call symputx('jobname',jobname);
run;


%mp_abort(iftrue= (%mf_nobs(work.sourcecode)=0)
  ,mac=&_program
  ,msg=%str(source table SOURCECODE is empty )
)
%mp_abort(iftrue= (&syscc ne 0)
  ,mac=&_program
  ,msg=%str(syscc=&syscc)
)

filename inref temp;
data _null_;
  file inref termstr=LF;
  set work.sourcecode;
  put codeline;
run;

%macro postcontent();
%if %mf_getplatform()=SASVIYA %then %do;
  %mv_createjob(
    path=&folderpath
    ,name=&jobname
    ,code=inref
    ,replace=YES
  )
%end;
%else %do;
  %mm_updatestpsourcecode(
    stp=&folderpath/&jobname
    ,stpcode=inref
  )
%end;
%mend postcontent;

%postcontent()

%mp_abort(iftrue= (&syscc ne 0)
  ,mac=&_program
  ,msg=%str(syscc=&syscc)
)

data work.result;
  result='SUCCESS';
run;

%webout(OPEN)
%webout(OBJ,result)
%webout(CLOSE)
