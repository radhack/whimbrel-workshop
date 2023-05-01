import { baseUrl } from '../util/constants'

type FinchConnectOptions = {
    products?: string[],
    embedded?: boolean,
    sandbox?: boolean,
    payroll_provider?: string
}
const products = ["company", "directory", "individual", "employment", "payment", "pay_statement"]

export function FinchConnect(options?: FinchConnectOptions) {

}