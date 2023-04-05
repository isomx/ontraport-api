import { map, mergeMap } from "rxjs/operators";

const _mapRespFn = resp => {
  const { headers} = resp;
  const type = headers && headers.get('content-type');
  return type === 'application/json'
    ? resp.json()
    : resp.text()
}

const _mergeMapResp = mergeMap(_mapRespFn);

export const mergeMapResp = () => _mergeMapResp;

const _mapToDataFn = resp => {
  if (!resp) return 500;
  if (resp.code === 0 || resp.code === 200) {
    return resp.data;
  }
  return resp.code;
}

const _mapToData = map(_mapToDataFn);

export const mapToData = () => _mapToData;

