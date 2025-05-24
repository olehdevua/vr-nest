{{/* vim: set filetype=mustache: */}}

{{- define "vr.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}
