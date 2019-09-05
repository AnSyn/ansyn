export class Utils {
	static m4SetFromArray(mat, values) {
		mat[0] = values[0];
		mat[1] = values[1];
		mat[2] = values[2];
		mat[3] = values[3];
		mat[4] = values[4];
		mat[5] = values[5];
		mat[6] = values[6];
		mat[7] = values[7];
		mat[8] = values[8];
		mat[9] = values[9];
		mat[10] = values[10];
		mat[11] = values[11];
		mat[12] = values[12];
		mat[13] = values[13];
		mat[14] = values[14];
		mat[15] = values[15];
		return mat;
	}

	static m4CreateNumber() {
		return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	}

	static m4Invert(mat, resultMat) {
		let m00 = mat[0], m10 = mat[1], m20 = mat[2], m30 = mat[3];
		let m01 = mat[4], m11 = mat[5], m21 = mat[6], m31 = mat[7];
		let m02 = mat[8], m12 = mat[9], m22 = mat[10], m32 = mat[11];
		let m03 = mat[12], m13 = mat[13], m23 = mat[14], m33 = mat[15];

		let a0 = m00 * m11 - m10 * m01;
		let a1 = m00 * m21 - m20 * m01;
		let a2 = m00 * m31 - m30 * m01;
		let a3 = m10 * m21 - m20 * m11;
		let a4 = m10 * m31 - m30 * m11;
		let a5 = m20 * m31 - m30 * m21;
		let b0 = m02 * m13 - m12 * m03;
		let b1 = m02 * m23 - m22 * m03;
		let b2 = m02 * m33 - m32 * m03;
		let b3 = m12 * m23 - m22 * m13;
		let b4 = m12 * m33 - m32 * m13;
		let b5 = m22 * m33 - m32 * m23;

		let det = a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0;
		if (det === 0) {
			return false;
		}

		let idet = 1.0 / det;
		resultMat[0] = (m11 * b5 - m21 * b4 + m31 * b3) * idet;
		resultMat[1] = (-m10 * b5 + m20 * b4 - m30 * b3) * idet;
		resultMat[2] = (m13 * a5 - m23 * a4 + m33 * a3) * idet;
		resultMat[3] = (-m12 * a5 + m22 * a4 - m32 * a3) * idet;
		resultMat[4] = (-m01 * b5 + m21 * b2 - m31 * b1) * idet;
		resultMat[5] = (m00 * b5 - m20 * b2 + m30 * b1) * idet;
		resultMat[6] = (-m03 * a5 + m23 * a2 - m33 * a1) * idet;
		resultMat[7] = (m02 * a5 - m22 * a2 + m32 * a1) * idet;
		resultMat[8] = (m01 * b4 - m11 * b2 + m31 * b0) * idet;
		resultMat[9] = (-m00 * b4 + m10 * b2 - m30 * b0) * idet;
		resultMat[10] = (m03 * a4 - m13 * a2 + m33 * a0) * idet;
		resultMat[11] = (-m02 * a4 + m12 * a2 - m32 * a0) * idet;
		resultMat[12] = (-m01 * b3 + m11 * b1 - m21 * b0) * idet;
		resultMat[13] = (m00 * b3 - m10 * b1 + m20 * b0) * idet;
		resultMat[14] = (-m03 * a3 + m13 * a1 - m23 * a0) * idet;
		resultMat[15] = (m02 * a3 - m12 * a1 + m22 * a0) * idet;
		return true;
	}

	static m4MultVec3Projective(mat, vec, resultVec) {
		let x = vec[0], y = vec[1], z = vec[2];
		let invw = 1 / (x * mat[3] + y * mat[7] + z * mat[11] + mat[15]);
		resultVec[0] = (x * mat[0] + y * mat[4] + z * mat[8] + mat[12]) * invw;
		resultVec[1] = (x * mat[1] + y * mat[5] + z * mat[9] + mat[13]) * invw;
		resultVec[2] = (x * mat[2] + y * mat[6] + z * mat[10] + mat[14]) * invw;
		return resultVec;
	}

	static uuid(): string {
		if (typeof (window) !== 'undefined' &&
			typeof (window.crypto) !== 'undefined' &&
			typeof (window.crypto.getRandomValues) !== 'undefined') {
			let buf: Uint16Array = new Uint16Array(8);
			window.crypto.getRandomValues(buf);
			return (
				this.pad4(buf[0]) +
				this.pad4(buf[1]) +
				'-' +
				this.pad4(buf[2]) +
				'-' +
				this.pad4(buf[3]) +
				'-' +
				this.pad4(buf[4]) +
				'-' +
				this.pad4(buf[5]) +
				'-' +
				this.pad4(buf[6]) +
				'-' +
				this.pad4(buf[7])
			);
		} else {
			return (
				this.random4() +
				this.random4() +
				'-' +
				this.random4() +
				'-' +
				this.random4() +
				'-' +
				this.random4() +
				'-' +
				this.random4() +
				'-' +
				this.random4() +
				'-' +
				this.random4()
			);
		}
	}

	private static pad4(num: number): string {
		let ret: string = num.toString(16);
		while (ret.length < 4) {
			ret = '0' + ret;
		}
		return ret;
	}

	private static random4(): string {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}
}
