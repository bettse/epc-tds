/**
 * 174-bit Global Document Type Identifier (GDTI)
 * 
 * The Global Document Type Identifier EPC scheme is used to assign a unique identity to 
 * a specific document, such as land registration papers, an insurance policy, and others.
 * 
 * Typical use: Document
 * 
 * @author Sergio S. - https://github.com/sergiss/epc-tds
 *
 */

 const Utils = require('../utils/utils');
 const { Epc } = require('../epc');
 const { Type } = require('../type');
 const { Partition } = require('../partition');
 
class Gdti174 extends Epc {

	static EPC_HEADER = 0x3E;

	static TOTAL_BITS = 174;
	static PARTITION_OFFSET = 11;
	static PARTITION_END    = 14;
	static SERIAL_OFFSET    = 55;
	static SERIAL_END       = Gdti174.TOTAL_BITS;
	static SERIAL_BITS      = 119;
	static MAX_SERIAL       = Utils.getMaxValue(Gdti174.SERIAL_BITS);
	
	static TAG_URI_TEMPLATE = (filter, company, document, serial) => {return `urn:epc:tag:gdti-174:${filter}.${company}.${document}.${serial}`}; // F.C.D.S (Filter, Company, Document, Serial)
	static PID_URI_TEMPLATE = (company, document, serial) => {return `urn:epc:id:gdti:${company}.${document}.${serial}`}; // C.I.S   (Company, Document, Serial)

	// Partition table columns: Company prefix, Item Reference
	static PARTITIONS = [ new Partition(Gdti174.PARTITION_END, 40, 12,  1, 0),   // 0 40 12 01 0
						  new Partition(Gdti174.PARTITION_END, 37, 11,  4, 1),   // 1 37 11 04 1
						  new Partition(Gdti174.PARTITION_END, 34, 10,  7, 2),   // 2 34 10 07 2 
						  new Partition(Gdti174.PARTITION_END, 30,  9, 11, 3),   // 3 30 09 11 3 
						  new Partition(Gdti174.PARTITION_END, 27,  8, 14, 4),   // 4 27 08 14 4 
						  new Partition(Gdti174.PARTITION_END, 24,  7, 17, 5),   // 5 24 07 17 5 
						  new Partition(Gdti174.PARTITION_END, 20,  6, 21, 6) ]; // 6 20 06 21 6

	constructor(hexEpc) {	
		super(Gdti174.TOTAL_BITS);
		if(hexEpc) {
			super.setFromHexString(hexEpc);
		} else {
			super.set(Gdti174.EPC_HEADER, Epc.EPC_HEADER_OFFSET, Epc.EPC_HEADER_END);
		}
	}

	clone() {
		return new Gdti174().setFromBitArray(this);
	}

	getType() {
		return Type.Gdti174;
	}

	toTagURI() { // F.C.D.S (Filter, Company, Document, Serial)
		let partition = Gdti174.PARTITIONS[this.getPartition()];
		return Gdti174.TAG_URI_TEMPLATE( this.getFilter(), this.getSegmentString(partition.a), this.getSegmentString(partition.b), this.getSerial());
	}

	toIdURI() { // C.D.S (Company, Document, Serial)
		let partition = Gdti174.PARTITIONS[this.getPartition()];
		return Gdti174.PID_URI_TEMPLATE( this.getSegmentString(partition.a), this.getSegmentString(partition.b), this.getSerial());
	}
	
	toBarcode() {
		return this.getGdti();
	}

	getTotalBits() {
		return Gdti174.TOTAL_BITS;
	}

	getHeader() {
		return Gdti174.EPC_HEADER;
	}

	getPartition() {
		return super.get(Gdti174.PARTITION_OFFSET, Gdti174.PARTITION_END);
	}

	setPartition(value) {
		if (value < 0 || value >= Gdti174.PARTITIONS.length) {
			throw new Error(`Value '${value}' out of range (min: 0, max: ${Gdti174.PARTITIONS.length - 1})`);
		}
		super.set(value, Gdti174.PARTITION_OFFSET, Gdti174.PARTITION_END);
		return this;
	}

	getGdti() {
		let partition = Gdti174.PARTITIONS[this.getPartition()];
        let companyPrefix = super.getSegmentString(partition.a);
		let document = super.getSegmentString(partition.b);		
        let result = companyPrefix + document;
		return result + Utils.computeCheckDigit(result) + this.getSerial();
	}

	setGdti(gdti) {
		let partition = Gdti174.PARTITIONS[this.getPartition()];  
		super.setSegment(gdti.substring(0, partition.a.digits), partition.a);
        let tmp = partition.a.digits + partition.b.digits;
		super.setSegment(gdti.substring(partition.a.digits, tmp), partition.b);
        this.setSerial(Number(gdti.substring(tmp + 1, gdti.length)));        
		return this;
	}

	getCompanyPrefix() {
		return super.getSegment(Gdti174.PARTITIONS[this.getPartition()].a);
	}

	setCompanyPrefix(value) {
		super.setSegment(value, Gdti174.PARTITIONS[this.getPartition()].a);
		return this;
	}

	getItemReference() {
		return super.getSegment(Gdti174.PARTITIONS[this.getPartition()].b);
	}

	setItemReference(value) {
		super.setSegment(value, Gdti174.PARTITIONS[this.getPartition()].b);
		return this;
	}

	getSerial() {
		return super.get(Gdti174.SERIAL_OFFSET, Gdti174.SERIAL_END);
	}

	setSerial(value) {
		if(value > Gdti174.MAX_SERIAL) throw new Error(`Value '${value}' out of range (min: 0, max: ${Gdti174.MAX_SERIAL})`);
		super.set(value, Gdti174.SERIAL_OFFSET, Gdti174.SERIAL_END);
		return this;
	}

}

module.exports = { Gdti174 };