/* © 2017
 * @author Vuong Tran
 */

const Notifier = Notification || window.Notification;

const Notify = (title, options) => new Notifier(title, options);

export default Notify;
