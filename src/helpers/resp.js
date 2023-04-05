
export const addPrevDataToResp = (resp, prevData) => {
  if (!prevData) return resp;
  const { data } = resp;
  resp.data = data
    ? [ ...prevData, ...data ]
    : prevData;
  return resp;
}
