import { useContext } from 'react';
import AlertContext from '../../context/alert/AlertContext';

const Alerts = () => {
  const alertContext = useContext(AlertContext);
  const { alerts } = alertContext;

  return (
    <div className="alerts-container">
      {alerts && alerts.length > 0 &&
        alerts.map(alert => (
          <div key={alert.id} className={`alert alert-${alert.type} alert-dismissible fade show alert-custom`} role="alert">
            <i className="fas fa-info-circle mr-2" /> {alert.msg}
            <button type="button" className="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        ))}
    </div>
  );
};

export default Alerts;