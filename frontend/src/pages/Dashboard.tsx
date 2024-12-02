import { Button } from '@fluentui/react-components';
import Logout from '../components/Logout';
import Cookies from 'js-cookie';

const Dashboard: React.FC = () => {
    function printTokens() {
        const accessToken = Cookies.get('accessToken');
        const refreshToken = Cookies.get('refreshToken');
        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);
    }

    return <div><Button onClick={printTokens}>Print Tokens</Button><Logout/></div>
}

export default Dashboard;
