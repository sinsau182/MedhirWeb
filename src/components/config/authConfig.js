const authConfig = {
    authority: 'https://zitadel-dev.medhir.in', //Replace with your issuer URL
    client_id: '333030566607782727', //Replace with your client id
    redirect_uri: 'http://localhost:3000/callback',
    // redirect_uri: 'https://dev.medhir.in/callback',
    response_type: 'code',
    scope: 'openid profile email urn:zitadel:iam:user:metadata',
    post_logout_redirect_uri: 'http://localhost:3000/',
    // post_logout_redirect_uri: 'https://dev.medhir.in/',
    userinfo_endpoint: 'https://zitadel-dev.medhir.in/oidc/v1/userinfo', 
    // userinfo_endpoint: 'http://localhost:3000/oidc/v1/userinfo',//Replace with your user-info endpoint
    response_mode: 'query',
    code_challenge_method: 'S256',
  };

 export default authConfig;