/**
  @file
  @brief Get job contents
  @details  Will fetch the contents (code) of a viya job or SAS 9 stored process.

  <h4> Service Inputs </h4>
  <h5>INDATA</h5>
  |folderpath|jobname|
  |---|---|
  |/some/folder|someJob|

  <h4> Service Outputs </h4>
  <h5>CODECONTENT</h5>
  |codeline|
  |---|
  |data demo;|
  | put 'this is some SAS code';|
  |run;|


  <h4> SAS Macros </h4>
  @li mf_getplatform.sas
  @li mv_getjobcode.sas
  @li mv_getjobcode.sas
  @li mm_getstpcode.sas

**/

%webout(FETCH)

data _null_;
  set indata;
  call symputx('folderpath',folderpath);
  call symputx('jobname',jobname);
run;

%let codepath=%sysfunc(pathname(work))/code.sas;

%macro getcontent();
%if %mf_getplatform()=SASVIYA %then %do;
  %mv_getjobcode(
     path=&folderpath
    ,name=&jobname
    ,outfile=&codepath
  )
%end;
%else %do;
  %mm_getstpcode(tree=&folderpath
    ,name=&jobname
    ,outloc=&codepath
  )
%end;
%mend;
%getcontent()

data work.codecontent;
  infile "&codepath";
  input;
  codeline=_infile_;
run;

%webout(OPEN)
%webout(OBJ,codecontent)
%webout(CLOSE)
