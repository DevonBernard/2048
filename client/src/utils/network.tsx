export const apiCall = async (method: string, path: string, body = {}) => {
  const payload: any = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (['POST', 'PUT', 'DELETE'].includes(method)) {
    payload.body = JSON.stringify(body);
  }
  const response = await fetch(`http://localhost:5002${path}`, payload);
  const respJson = await response.json();
  if (response.status !== 200) {
    if (respJson?.error) {
      alert(respJson?.error);
    }
  }
  return { response, respJson };
};
