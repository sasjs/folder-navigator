/**
  @file
  @brief Get folder contents
  @details  Will fetch the contents of a particular folder given a `folderpath`
  as input.

  <h4> Service Inputs </h4>
  <h5> INDATA </h5>
  |folderpath|
  |---|
  |/Public/app/foldernavigator/services/common|

  <h4> Service Outputs </h4>
  <h5> CONTENT </h5>
  |itemid $|itemname $| itemtype $|itempath $|
  |---|---|---|---|
  |ff726405-3548-40b0-acd3-99589ec0d112|appinit|jobDefinition|/Public/app/foldernavigator/services/common|
  |c63c5bcc-7b34-4f37-9558-8cb1c0824d23|getfoldercontents|jobDefinition|/Public/app/foldernavigator/services/common|

  <h4> SAS Macros </h4>
  @li mf_getplatform.sas
  @li mv_getfoldermembers.sas
  @li mm_getfoldermembers.sas

**/

%webout(FETCH)

data _null_;
  set indata;
  call symputx('folderpath',folderpath);
run;

%macro getcontent();
%if %mf_getplatform()=SASVIYA %then %do;
  %mv_getfoldermembers(root=&folderpath,outds=work.folders)
  data folders;
    length itemtype $32 name id $64;
    set folders(rename=(name=itemname id=itemid type=itemtype));
    keep itemname itemid itemtype itempath;
    itemname=name;
    itemid=id;
    itemtype=type;
    if itemtype in ('folder','userRoot') then itemtype='Folder';
    else if cats(contenttype)='folder' then itemtype='Folder';
    else itemtype=cats(contenttype);
    itempath="&folderpath";
  run;
%end;
%else %do;
  %mm_getfoldermembers(root=&folderpath,outds=folders)
  data folders;
    set folders(rename=(metauri=itemid metaname=itemname metatype=itemtype));
    keep itemname itemid itemtype itempath;
    itempath="&folderpath";
  run;
%end;
%mend;

%getcontent()

proc sort;
  by itemname;
run;

%webout(OPEN)
%webout(OBJ,folders)
%webout(CLOSE)
