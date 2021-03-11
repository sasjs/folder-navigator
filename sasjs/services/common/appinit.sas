/**
  @file appinit.sas
  @brief Initialisation service - runs on app startup
  @details  This is always the first service called when the app is opened.

  <h4> SAS Macros </h4>
  @li mf_getplatform.sas
  @li mv_getfoldermembers.sas
  @li mm_getfoldermembers.sas

  <h4> Service Outputs </h4>
  <h5> FOLDERS </h5>
  |itemid $|itemname $| itemtype $|itempath $|
  |---|---|---|---|
  |ff726405-3548-40b0-acd3-99589ec0d112|Public|Folder|/|
  |c63c5bcc-7b34-4f37-9558-8cb1c0824d23|Users|Folder|/|


**/

%macro appinit();
%if %mf_getplatform()=SASVIYA %then %do;
  %mv_getfoldermembers(root=/,outds=folders)
  data folders;
    length itemtype $32;
    set folders(rename=(name=itemname id=itemid type=itemtype));
    keep itemname itemid itemtype itempath;
    if itemtype in ('folder','userRoot') then itemtype='Folder';
    itempath="/";
  run;
%end;
%else %do;
  %mm_getfoldermembers(root=/,outds=folders)
  data folders;
    set folders(rename=(metauri=itemid metaname=itemname metatype=itemtype));
    keep itemname itemid itemtype itempath;
    itempath='/';
  run;
  proc sort;
    by itemname;
  run;
%end;
%mend;

%appinit()

%webout(OPEN)
%webout(OBJ,folders)
%webout(CLOSE)
