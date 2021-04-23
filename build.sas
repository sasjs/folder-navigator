/**
  @file
  @brief quick switch to run either viya or sas 9 build file
  @details run the below to deploy the app on either SAS 9 or SAS Viya

      filename runme url "https://raw.githubusercontent.com/sasjs/folder-navigator/master/build.sas";
      %inc runme;

**/

filename mc url "https://raw.githubusercontent.com/sasjs/core/main/all.sas";
%inc mc;

%macro switch();
%if %mf_getplatform()=SASMETA %then %do;
  filename s9 url "https://raw.githubusercontent.com/sasjs/folder-navigator/master/buildsas9.txt";
  %inc s9;
%end;
%else %do;
  filename bv url "https://raw.githubusercontent.com/sasjs/folder-navigator/master/buildviya.txt";
  %inc bv;
%end;
%mend switch;

%switch()