/** @format **/

/**
 * External dependencies
 */
import { dateI18n } from '@wordpress/date';
import moment from 'moment';
import { formatCurrency } from '@woocommerce/currency';
import { TableCard, Link } from '@woocommerce/components';
import { capitalize } from 'lodash';
import Gridicon from 'gridicons';
import { addQueryArgs } from '@wordpress/url';
import { Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import withSelect from 'payments-api/with-select';
import OrderLink from '../components/order-link';
import './style.scss';
import { isInTestMode } from '../util';

// TODO make date / time, amount, fee, and net sortable - when date time is sortable, the background of the info buttons should match
const headers = [
	{ key: 'details', label: '', required: true, cellClassName: 'info-button' },
	{ key: 'created', label: 'Date / Time', required: true, isLeftAligned: true, defaultOrder: 'desc', cellClassName: 'date-time' },
	{ key: 'type', label: 'Type', required: true },
	{ key: 'amount', label: 'Amount', isNumeric: true },
	{ key: 'fee', label: 'Fees', isNumeric: true },
	{ key: 'net', label: 'Net', isNumeric: true, required: true },
	{ key: 'order', label: 'Order #', required: true },
	{ key: 'source', label: 'Source' },
	{ key: 'customer', label: 'Customer' },
	{ key: 'email', label: 'Email', hiddenByDefault: true },
	{ key: 'country', label: 'Country', hiddenByDefault: true },
	// TODO { key: 'deposit', label: 'Deposit', required: true },
	{ key: 'riskLevel', label: 'Risk Level', hiddenByDefault: true },
];

const noticeMessage = 'Viewing test transactions.' +
	' To view live transactions, disable test mode in WooCommerce Payments';
const settingsUrl = (
	<a href="/wp-admin/admin.php?page=wc-settings&tab=checkout&section=woocommerce_payments">
		{ __( 'settings', 'woocommerce-payments' ) }
	</a>
);
const notice = (
	<div>
		<Notice status="warning" isDismissible={ false }>
			<p>{ __( noticeMessage, 'woocommerce-payments' ) } { settingsUrl }.</p>
		</Notice>
		<br />
	</div>
);

export const TransactionsList = ( props ) => {
	const { transactions, showPlaceholder } = props;
	const transactionsData = transactions.data || [];
	// Do not display table loading view if data is already available.

	const rows = transactionsData.map( ( txn ) => {
		const charge = txn.source.object === 'charge' ? txn.source : ( txn.source.charge || null );

		const orderUrl = <OrderLink order={ txn.order } />;
		// TODO: come up with a link generator utility (woocommerce-payments#229)
		const detailsUrl = addQueryArgs(
			'admin.php',
			{
				page: 'wc-admin',
				path: '/payments/transactions/details',
				id: txn.id,
			}
		);
		const detailsLink = (
			<Link className="transaction-details-button" href={ detailsUrl } >
				<Gridicon icon="info-outline" size={ 18 } />
			</Link>
		);

		// Extract nested properties from the charge.
		const billingDetails = charge ? charge.billing_details : null;
		const outcome = charge ? charge.outcome : null;
		const paymentMethodDetails = charge ? charge.payment_method_details : null;
		const address = billingDetails ? billingDetails.address : null;
		const card = paymentMethodDetails ? paymentMethodDetails.card : null;

		// Map transaction into table row.
		const data = {
			created: { value: txn.created * 1000, display: dateI18n( 'M j, Y / g:iA', moment( txn.created * 1000 ) ) },
			type: { value: txn.type, display: capitalize( txn.type ) },
			source: card && { value: card.brand, display: <code>{ card.brand }</code> },
			order: { value: txn.order, display: orderUrl },
			customer: billingDetails && { value: billingDetails.name, display: billingDetails.name },
			email: billingDetails && { value: billingDetails.email, display: billingDetails.email },
			country: address && { value: address.country, display: address.country },
			amount: { value: txn.amount / 100, display: formatCurrency( txn.amount / 100 ) },
			// fees should display as negative. The format $-9.99 is determined by WC-Admin
			fee: { value: txn.fee / 100, display: formatCurrency( ( txn.fee / 100 ) * -1 ) },
			net: { value: ( txn.amount - txn.fee ) / 100, display: formatCurrency( ( txn.amount - txn.fee ) / 100 ) },
			// TODO deposit: { value: available_on * 1000, display: dateI18n( 'Y-m-d H:i', moment( available_on * 1000 ) ) },
			riskLevel: outcome && { value: outcome.risk_level, display: capitalize( outcome.risk_level ) },
			details: { value: txn.id, display: detailsLink },
		};

		return headers.map( ( { key } ) => data[ key ] || { display: null } );
	} );

	return (
		<div>
			{ isInTestMode() ? notice : null }
			<TableCard
				title="Transactions"
				isLoading={ showPlaceholder }
				rowsPerPage={ 10 }
				totalRows={ 10 }
				headers={ headers }
				rows={ rows }
			/>
		</div>
	);
};

export default withSelect( select => {
	const { getTransactions, showTransactionsPlaceholder } = select( 'wc-payments-api' );
	const transactions = getTransactions();
	const showPlaceholder = showTransactionsPlaceholder();

	return { transactions, showPlaceholder };
} )( TransactionsList );
