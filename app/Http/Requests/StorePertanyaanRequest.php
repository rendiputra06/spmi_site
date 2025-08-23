<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePertanyaanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $indikator = $this->route('indikator');
        return $this->user()->can('update', $indikator->standar);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'isi' => 'required|string',
        ];
    }
}
